// Server handlers for authentication (authn).  Authorization (authz) is done
// in the server's charon handlers.
//
const querystring = require("querystring");
const session = require("express-session");
const Redis = require("ioredis");
const RedisStore = require("connect-redis")(session);
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const {jwtVerify} = require('jose/jwt/verify');                   // eslint-disable-line import/no-unresolved
const {createRemoteJWKSet} = require('jose/jwks/remote');         // eslint-disable-line import/no-unresolved
const {JWTClaimValidationFailed} = require('jose/util/errors');   // eslint-disable-line import/no-unresolved
const sources = require("./src/sources");
const utils = require("./src/utils");

const PRODUCTION = process.env.NODE_ENV === "production";

const SESSION_SECRET = PRODUCTION
  ? process.env.SESSION_SECRET
  : "BAD SECRET FOR DEV ONLY";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30d in seconds

/* Our heroku apps (nextstrain-dev & nextstrain-server) set the `REDIS_URL` env variable */
const REDIS_URL = process.env.REDIS_URL;

const COGNITO_USER_POOL_ID = "us-east-1_Cg5rcTged";

const COGNITO_REGION = COGNITO_USER_POOL_ID.split("_")[0];

const COGNITO_USER_POOL_URL = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;

const COGNITO_JWKS = createRemoteJWKSet(new URL(`${COGNITO_USER_POOL_URL}/.well-known/jwks.json`));

const COGNITO_BASE_URL = "https://login.nextstrain.org";

const COGNITO_CLIENT_ID = PRODUCTION
  ? "rki99ml8g2jb9sm1qcq9oi5n"    // prod client limited to nextstrain.org
  : "6q7cmj0ukti9d9kdkqi2dfvh7o"; // dev client limited to localhost and heroku dev instances

/* Arbitrary ids for the various strategies for Passport.  Makes explicit the
 * implicit defaults; uses constants instead of string literals for better
 * grepping, linting, and less magic; would be an enum if JS had them (or we
 * had TypeScript).
 */
const STRATEGY_OAUTH2 = "oauth2";

function setup(app) {
  passport.use(
    STRATEGY_OAUTH2,
    new OAuth2Strategy(
      {
        authorizationURL: `${COGNITO_BASE_URL}/oauth2/authorize`,
        tokenURL: `${COGNITO_BASE_URL}/oauth2/token`,
        clientID: COGNITO_CLIENT_ID,
        callbackURL: "/logged-in",
        pkce: true,
        state: true
      },
      async (accessToken, refreshToken, {id_token: idToken}, profile, done) => {
        // Verify both tokens for good measure, but pull user information from
        // the identity token (which is its intended purpose).
        await verifyToken(accessToken, "access");

        const idClaims = await verifyToken(idToken, "id");
        const user = {
          username: idClaims["cognito:username"],
          groups: idClaims["cognito:groups"],
        };

        // All users are ok, as we control the entire user pool.
        return done(null, user);
      }
    )
  );

  // Serialize the entire user profile to the session store to avoid additional
  // requests to Cognito when we need to load back a user profile from their
  // session cookie.
  passport.serializeUser((profile, done) => {
    return done(null, JSON.stringify(profile));
  });

  passport.deserializeUser((profile, done) => {
    return done(null, JSON.parse(profile));
  });

  // Setup session storage and passport.
  const sessionStore = () => {
    if (REDIS_URL) {
      const url = new URL(REDIS_URL);

      // Heroku Redis' TLS socket is documented to be on the next port up.  The
      // scheme for secure redis:// URLs is rediss://.
      if (url.protocol === "redis:") {
        utils.verbose(`Rewriting Redis URL <${scrubUrl(url)}> to use TLS`);
        url.protocol = "rediss:";
        url.port = Number(url.port) + 1;
      }

      utils.verbose(`Storing sessions in Redis at <${scrubUrl(url)}>`);

      const client = new Redis(url.toString(), {
        tls: {
          // It is pretty frustrating that Heroku doesn't provide verifiable
          // certs.  Although we're not using the Heroku Redis buildpack, the
          // issue is documented here nicely
          // <https://github.com/heroku/heroku-buildpack-redis/issues/15>.
          rejectUnauthorized: false
        }
      });

      return new RedisStore({
        client,

        // Using a key prefix reduces the chance that we conflict with
        // potential future usage of Redis in this codebase.  While this is
        // very unlikely because the session keys are long random strings, I
        // like code to be defensive and future-proof.
        prefix: "nextstrain.org-session:",
        ttl: SESSION_MAX_AGE
      });
    }

    /* If no REDIS_URL is available, then we are running in a development
    environment and want to use a local FileStore to store the session.
    We limit the retries to 0 to avoid excessive warnings when the
    browser remembers a session id that is not on your filesystem */
    utils.verbose("Storing sessions as files under session/");
    return new FileStore({ttl: SESSION_MAX_AGE, retries: 0});
  };

  app.use(
    session({
      name: "nextstrain.org",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      store: sessionStore(),
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: PRODUCTION,
        maxAge: SESSION_MAX_AGE * 1000 // milliseconds
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Set the app's origin centrally so other handlers can use it
  //
  // We can trust the HTTP Host header (req.hostname) because we're always
  // running behind name-based virtual hosting on Heroku.  A forged Host header
  // will be rejected by Heroku and never make it to us.
  app.use((req, res, next) => {
    res.locals.origin = PRODUCTION
      ? `${req.protocol}://${req.hostname}`
      : `${req.protocol}://${req.hostname}:${req.app.get("port")}`;
    next();
  });

  // Routes
  //
  // Authenticate with Cognito IdP on /login and establish a local session
  app.route("/login").get(
    (req, res, next) => {
      /* Save the original page the user was on with a best-effort approach.
       * If there is no Referer or it's not parseable as a URL, then ignore it
       * and we'll do the default thing of redirecting to the home page.
       *
       * Only use the Referer if it points to ourselves, so that our login flow
       * can't be abused to send folks to external sites.
       */
      try {
        const referer = new URL(req.header("Referer"));

        if (res.locals.origin === referer.origin) {
          req.session.afterLoginReturnTo = referer.pathname;
        }
      } catch (e) {
        // intentionally left empty
      }
      next();
    },
    passport.authenticate(STRATEGY_OAUTH2)
  );

  // Verify IdP response on /logged-in
  app.route("/logged-in").get(
    passport.authenticate(STRATEGY_OAUTH2, { failureRedirect: "/login" }),
    (req, res) => {
      // We can trust this value from the session because we are the only ones
      // in control of it.
      res.redirect(req.session.afterLoginReturnTo || "/");
    }
  );

  // Delete our local session and redirect to logout from Cognito IdP
  app.route("/logout").get((req, res) => {
    req.session.destroy(() => {
      const params = {
        client_id: COGNITO_CLIENT_ID,
        logout_uri: res.locals.origin
      };
      res.redirect(`${COGNITO_BASE_URL}/logout?${querystring.stringify(params)}`);
    });
  });

  /**
   * Returns an array of Nextstrain groups that are visible to a
   * given *user* (or a non-logged in user). The order of groups returned
   * matches the `sources` array in `sources.js`.
   *
   * FIX: Contains a hard-coded assumption that all Nextstrain groups match
   * their corresponding group name exactly.
   * See <https://github.com/nextstrain/nextstrain.org/issues/76> for more
   * context and to track this issue.
   *
   * @param {Object | undefined} user. `undefined` represents a non-logged-in user
   * @returns {Array} Each element is an object with keys `name` -> {str} (group name) and
   *                  `private` -> {bool} (group is private)
   */
  const visibleGroups = (user) => Array.from(sources)
      .filter(([, source]) => source.isGroup())
      .filter(([, source]) => source.visibleToUser(user))
      .map(([sourceName, source]) => ({
        name: sourceName,
        private: !source.visibleToUser(undefined)
      }));

  // Provide the client-side app with info about the current user
  app.route("/whoami").get((req, res) => {
    return res.format({
      html: () => res.redirect(
        req.user
          ? `/users/${req.user.username}`
          : "/users"),

      // Express's JSON serialization drops keys with undefined values
      json: () => res.json({
        user: req.user || null,
        visibleGroups: visibleGroups(req.user)
      })
    });
  });

  const nonPublicSources = Array.from(sources.entries())
    .filter(([name, Source]) => !Source.visibleToUser(null)) // eslint-disable-line no-unused-vars
    .map(([name, Source]) => `/groups/${name}`); // eslint-disable-line no-unused-vars

  app.use(nonPublicSources, (req, res, next) => {
    // Prompt for login if an anonymous user asks for a non-public source.
    if (!req.user) {
      utils.verbose(`Redirecting anonymous user to login page from ${req.originalUrl}`);
      req.session.afterLoginReturnTo = req.originalUrl;
      return res.redirect("/login");
    }

    // Otherwise, let the server's normal route handle this request, which
    // should fall through to Auspice.
    return next("route");
  });
}

/**
 * Verifies all aspects of the given `token` (a signed JWT from our AWS Cognito
 * user pool) which is expected to be used for the given `use`.
 *
 * Assertions about expected algorithms, audience, issuer, and token use follow
 * guidelines from
 * <https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html>.
 *
 * @param {String} token
 * @param {String} use
 * @returns {Object} Verified claims from the token's payload
 */
async function verifyToken(token, use) {
  const {payload: claims} = await jwtVerify(token, COGNITO_JWKS, {
    algorithms: ["RS256"],
    issuer: COGNITO_USER_POOL_URL,
    audience: use !== "access" ? COGNITO_CLIENT_ID : null,
  });

  const claimedUse = claims["token_use"];

  if (claimedUse !== use) {
    throw new JWTClaimValidationFailed(`unexpected "token_use" claim value: ${claimedUse}`, "token_use", "check_failed");
  }

  return claims;
}

function scrubUrl(url) {
  const scrubbedUrl = new URL(url);
  scrubbedUrl.password = "XXXXXX";
  return scrubbedUrl;
}

module.exports = {
  setup
};
