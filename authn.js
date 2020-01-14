// Server handlers for authentication (authn).  Authorization (authz) is done
// in the server's charon handlers.
//
const querystring = require("querystring");
const session = require("express-session");
const Redis = require("ioredis");
const RedisStore = require("connect-redis")(session);
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const sources = require("./auspice/server/sources");
const utils = require("./auspice/server/utils");

const PRODUCTION = process.env.NODE_ENV === "production";

const SESSION_SECRET = PRODUCTION
  ? process.env.SESSION_SECRET
  : "BAD SECRET FOR DEV ONLY";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30d in seconds

const REDIS_URL = process.env.REDIS_URL;

const COGNITO_USER_POOL_ID = "us-east-1_Cg5rcTged";

const COGNITO_REGION = COGNITO_USER_POOL_ID.split("_")[0];

const COGNITO_BASE_URL = "https://login.nextstrain.org";

const COGNITO_CLIENT_ID = PRODUCTION
  ? "rki99ml8g2jb9sm1qcq9oi5n"    // prod client limited to nextstrain.org
  : "6q7cmj0ukti9d9kdkqi2dfvh7o"; // dev client limited to localhost and heroku dev instances

function setup(app) {
  // Use OAuth2 to authenticate against AWS Cognito's identity provider (IdP)
  // Implement OAuth2Strategy's stub for fetching user info.
  OAuth2Strategy.prototype.userProfile = async (accessToken, done) => {
    try {
      const response = await fetch(
        `${COGNITO_BASE_URL}/oauth2/userInfo`,
        { headers: { Authorization: `Bearer ${accessToken}` }}
      );
      const profile = await response.json();
      return done(null, profile);
    } catch (error) {
      return done(`Unable to fetch user info: ${error}`);
    }
  };

  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: `${COGNITO_BASE_URL}/oauth2/authorize`,
        tokenURL: `${COGNITO_BASE_URL}/oauth2/token`,
        clientID: COGNITO_CLIENT_ID,
        callbackURL: "/logged-in",
        pkce: true,
        state: true
      },
      async (accessToken, refreshToken, profile, done) => {
        // Fetch groups from Cognito, which our data sources
        // (auspice/server/sources.js) use for authorization.
        //
        // In the future we could use Cognito Identity Pools to get per-user
        // AWS credentials, but that's more complicated and takes more to
        // setup.
        const cognitoIdp = new AWS.CognitoIdentityServiceProvider({region: COGNITO_REGION});

        const response = await cognitoIdp.adminListGroupsForUser({
          UserPoolId: COGNITO_USER_POOL_ID,
          Username: profile.username
        }).promise();

        const groups = response.Groups.map((g) => g.GroupName);

        // All users are ok, as we control the entire user pool.
        return done(null, {...profile, groups});
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

    utils.verbose("Storing sessions as files under session/");
    return new FileStore({ttl: SESSION_MAX_AGE});
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
    passport.authenticate("oauth2")
  );

  // Verify IdP response on /logged-in
  app.route("/logged-in").get(
    passport.authenticate("oauth2", { failureRedirect: "/login" }),
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
    .map(([name, Source]) => `/${name}`); // eslint-disable-line no-unused-vars

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

function scrubUrl(url) {
  const scrubbedUrl = new URL(url);
  scrubbedUrl.password = "XXXXXX";
  return scrubbedUrl;
}

module.exports = {
  setup
};
