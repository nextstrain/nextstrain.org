// Server handlers for authentication (authn).  Authorization (authz) is done
// in the server's charon handlers.
//
import debugFactory from 'debug';
const debug = debugFactory("nextstrain:authn");
import querystring from 'querystring';
import session from 'express-session';
import RedisStoreFactory from 'connect-redis';
const RedisStore = RedisStoreFactory(session);
import FileStoreFactory from 'session-file-store';
const FileStore = FileStoreFactory(session);
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { jwtVerify } from 'jose/jwt/verify';
import { createRemoteJWKSet } from 'jose/jwks/remote';
import { JOSEError, JWTClaimValidationFailed, JWTExpired } from 'jose/util/errors';
import partition from 'lodash.partition';
import BearerStrategy from './bearer.js';
import { getTokens, setTokens, deleteTokens } from './session.js';
import { PRODUCTION, OIDC_ISSUER_URL, OIDC_JWKS_URL, OAUTH2_AUTHORIZATION_URL, OAUTH2_TOKEN_URL, OAUTH2_LOGOUT_URL, OAUTH2_SCOPES_SUPPORTED, OIDC_USERNAME_CLAIM, OIDC_GROUPS_CLAIM, OIDC_IAT_BACKDATED_BY, OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, OAUTH2_CLI_CLIENT_ID, SESSION_COOKIE_DOMAIN, SESSION_SECRET, SESSION_MAX_AGE } from '../config.js';
import { AuthnRefreshTokenInvalid, AuthnTokenTooOld } from '../exceptions.js';
import { fetch } from '../fetch.js';
import { Group } from '../groups.js';
import { Unauthorized, HttpErrors } from '../httpErrors.js';
import { REDIS } from '../redis.js';
import { userStaleBefore } from '../user.js';
import * as utils from '../utils/index.js';

const OIDC_JWKS = createRemoteJWKSet(new URL(OIDC_JWKS_URL));

// These are all scopes defined by OpenID Connect.
const requiredScopes = ["openid", "profile"];
const optionalScopes = ["email", "offline_access"];

const missingScopes = requiredScopes.filter(s => !OAUTH2_SCOPES_SUPPORTED.has(s));
if (missingScopes.length) {
  throw new Error(`OAuth2 IdP does not advertise support for the required scopes: ${Array.from(missingScopes).join(" ")}`);
}

const OAUTH2_SCOPES = [
  ...requiredScopes,
  ...optionalScopes.filter(s => OAUTH2_SCOPES_SUPPORTED.has(s)),
];


/* Registered clients to accept for Bearer tokens.
 *
 * In the future, we could opt to pull this list dynamically from Cognito at
 * server start and might want to if we start having third-party clients, but
 * avoid a start-time dep for now.
 */
const BEARER_OAUTH2_CLIENT_IDS = [
  OAUTH2_CLI_CLIENT_ID,  // Nextstrain CLI
];

/* Arbitrary ids for the various strategies for Passport.  Makes explicit the
 * implicit defaults; uses constants instead of string literals for better
 * grepping, linting, and less magic; would be an enum if JS had them (or we
 * had TypeScript).
 */
const STRATEGY_OAUTH2 = "oauth2";
const STRATEGY_BEARER = "bearer";
const STRATEGY_SESSION = "session";

function setup(app) {
  passport.use(
    STRATEGY_OAUTH2,
    new OAuth2Strategy(
      {
        authorizationURL: OAUTH2_AUTHORIZATION_URL,
        tokenURL: OAUTH2_TOKEN_URL,
        clientID: OAUTH2_CLIENT_ID,
        callbackURL: "/logged-in",
        scope: OAUTH2_SCOPES,
        clientSecret: OAUTH2_CLIENT_SECRET,
        pkce: true,
        state: true,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, {id_token: idToken}, profile, done) => {
        try {
          // Verifies tokens
          const user = await userFromTokens({idToken, accessToken, refreshToken});

          // Only store tokens in session _after_ we verify them and have a user.
          await setTokens(req.session, {idToken, accessToken, refreshToken});

          // All users are ok, as we control the entire user pool.
          return done(null, user);
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  passport.use(
    STRATEGY_BEARER,
    new BearerStrategy(
      {
        realm: "nextstrain.org",
        passIfMissing: true,
      },
      async (idToken, done) => {
        try {
          const user = await userFromIdToken(idToken, BEARER_OAUTH2_CLIENT_IDS);
          return done(null, user);
        } catch (e) {
          if (e instanceof JOSEError) {
            return done(null, false, "Error verifying token");
          } else if (e instanceof AuthnTokenTooOld) {
            return done(null, false, "Token too old; renew it and try again");
          }
          // Internal error of some kind
          return done(e);
        }
      }
    )
  );

  /* We recreate user objects solely from the stored tokens, so technically
   * don't need any serialized user stored in the session, but marking each
   * session with its username is useful for logging (e.g. see below) as well
   * as ad-hoc adminstration and troubleshooting.
   */
  passport.serializeUser((user, done) => {
    const serializedUser = {username: user.username};
    return done(null, JSON.stringify(serializedUser));
  });

  passport.deserializeUser((req, serializedUser, done) => {
    deserializeUser(req, serializedUser)
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  async function deserializeUser(req, serializedUser) {
    /* Mark the request as being authenticated with a session, which is
     * strongly indicative of a browser client (as API clients use tokens).
     *
     * This deserialization function is called on every request when there's a
     * session user to deserialize, unlike our .authenticate() callback in
     * authnWithSession(), so it's the only place we can mark this context.
     */
    req.context.authnWithSession = true;

    const {username} = JSON.parse(serializedUser);

    /* We ignore the serialized user object and instead recreate the user
     * object directly from the tokens.  This lets us avoid issues with user
     * object migrations over time (like we had to deal with previously) and
     * also lets us periodically refresh user data from Cognito when we
     * automatically renew tokens.
     */
    const tokens = await getTokens(req.session);

    if (!tokens) {
      debug(`Unable to restore user object for ${username} without tokens (session ${req.session.id.substr(0, 7)}…)`);
      return null;
    }

    debug(`Restoring user object for ${username} from tokens (session ${req.session.id.substr(0, 7)}…)`);
    let {idToken, accessToken, refreshToken} = tokens;

    try {
      try {
        return await userFromTokens({idToken, accessToken, refreshToken});
      } catch (err) {
        /* If expired, then try to renew tokens.  This may still fail if the
         * refreshToken expired or was revoked since being stored in the
         * session.
         */
        if (err instanceof JWTExpired || err instanceof AuthnTokenTooOld) {
          debug(`Renewing tokens for ${username} (session ${req.session.id.substr(0, 7)}…)`);
          ({idToken, accessToken, refreshToken} = await renewTokens(refreshToken));

          const updatedUser = await userFromTokens({idToken, accessToken, refreshToken});

          // Update tokens in session only _after_ we verify them and have a user.
          await setTokens(req.session, {idToken, accessToken, refreshToken});

          // Success after renewal.
          debug(`Renewed tokens for ${username} (session ${req.session.id.substr(0, 7)}…)`);
          return updatedUser;
        }
        throw err; // recaught immediately below
      }
    } catch (err) {
      /* If tokens are unsuable (invalid, expired, revoked, etc) then remove
       * them from the session and log the user out by returning a null user
       * object.  Passport will remove the user from the session.  This may
       * trigger a redirect to login later in the request processing.
       */
      if (err instanceof JOSEError || err instanceof AuthnRefreshTokenInvalid) {
        debug(`Destroying unusable tokens for ${username} (session ${req.session.id.substr(0, 7)}…)`);
        await deleteTokens(req.session);
        return null;
      }

      // Internal error of some kind
      throw err;
    }
  }

  // Setup session storage and passport.
  const sessionStore = () => {
    if (REDIS) {
      utils.verbose(`Storing sessions in Redis at <${REDIS.scrubbedUrl}>`);

      return new RedisStore({
        client: REDIS,

        // Using a key prefix reduces the chance that we conflict with
        // potential future usage of Redis in this codebase.  While this is
        // very unlikely because the session keys are long random strings, I
        // like code to be defensive and future-proof.
        prefix: "nextstrain.org-session:",
        ttl: SESSION_MAX_AGE
      });
    }

    /* If no REDIS_URL is available (e.g. in local development or
     * single-instance production), then use a local FileStore to store the
     * session.  We limit the retries to 0 to avoid excessive warnings when the
     * browser remembers a session id that is not on your filesystem.
     */
    utils.verbose("Storing sessions as files under session/");
    return new FileStore({ttl: SESSION_MAX_AGE, retries: 0});
  };

  app.use(
    session({
      name: "nextstrain.org-session",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      store: sessionStore(),
      cookie: {
        domain: SESSION_COOKIE_DOMAIN,
        httpOnly: true,
        sameSite: "lax",
        secure: PRODUCTION,
        maxAge: SESSION_MAX_AGE * 1000 // milliseconds
      }
    }),
  );

  app.use(passport.initialize());
  app.use(authnWithToken);
  app.use(authnWithSession);

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

        if (req.context.origin === referer.origin) {
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
    passport.authenticate(STRATEGY_OAUTH2, { failureRedirect: "/" }),
    (req, res) => {
      debug(`New login for ${req.user.username} (session ${req.session.id.substr(0, 7)}…)`);

      // We can trust this value from the session because we are the only ones
      // in control of it.
      const afterLoginReturnTo = req.session.afterLoginReturnTo;
      delete req.session.afterLoginReturnTo;
      res.redirect(afterLoginReturnTo || "/");
    }
  );

  // Delete our local session and redirect to logout from Cognito IdP
  app.route("/logout").get((req, res) => {
    req.session.destroy(() => {
      const params = {
        client_id: OAUTH2_CLIENT_ID,
        logout_uri: req.context.origin
      };
      res.redirect(`${OAUTH2_LOGOUT_URL}?${querystring.stringify(params)}`);
    });
  });
}


/**
 * Authenticate request user with HTTP Bearer authentication.
 *
 * If an Authorization header is present, then it must container a valid Bearer
 * token.  No session will be created for Bearer authn.
 *
 * If an Authorization header is not present, this authn strategy is configured
 * (above) to pass to the next request handler (user restoration from session).
 *
 * @type {expressMiddleware}
 */
function authnWithToken(req, res, next) {
  const authenticate = passport.authenticate(STRATEGY_BEARER, (err, user, challenge, status) => {
    /* Passport strategies have four result states.  Handle all four, as the
     * STRATEGY_BEARER can produce all of them.
     */

    // error: something went wrong internally; can't be remediated by client
    if (err) return next(err);

    // failure: authn attempted but failed; may be remediated by client
    if (!user && (challenge || status)) {
      if (challenge) {
        res.set("WWW-Authenticate", challenge);
      }
      return next(
        status
          ? new HttpErrors[status]()
          : new Unauthorized()
      );
    }

    // success: authn worked
    if (user) {
      /* Mark the request as being token-authenticated, which is strongly
       * indicative of an API client (as browser clients use cookied-based
       * sessions after OAuth2).
       */
      req.context.authnWithToken = true;

      return req.login(user, { session: false }, next);
    }

    // pass: authn not attempted
    return next();
  });
  return authenticate(req, res, next);
}


/**
 * Authenticate request user with session cookie.
 *
 * Restores the authenticated user from the session, if any.  If there is no
 * session user or the session user is invalid in any way, then req.user will
 * be null.
 *
 * @type {expressMiddleware}
 */
function authnWithSession(req, res, next) {
  const authenticate = passport.authenticate(STRATEGY_SESSION, err => {
    // err is always true in practice; see below.
    if (err) {
      utils.verbose(`Failed to deserialize user from session (${err}); leaving session intact but ignoring user`);
      return next();
    }

    /* This part is never actually reachable because Passport's
     * SessionStrategy.authenticate() method only calls .error() (and .pass())
     * but never .success(), so the callback we're in here is only ever called
     * when "err" is true, which we handle above.  In the unlikely event this
     * behaviour ever changes and this code becomes reachable, at least keep
     * the request processing going, though we'd likely have to start doing
     * something with the user passed as the second callback arg too.
     *   -trs, 16 June 2022
     */
    return next();
  });
  return authenticate(req, res, next);
}


/**
 * Creates a user record from the given `idToken` after verifying it and
 * ensuring the associated `accessToken` and `refreshToken` exist.
 *
 * Use this function instead of {@link userFromIdToken} if you have all three
 * tokens (e.g. after initial OAuth2 login or session token renewal), as it
 * correctly verifies all three tokens together.
 *
 * @param {String} idToken
 * @param {String} accessToken
 * @param {String} refreshToken
 * @param {String|String[]} client. Optional. Passed to `verifyIdToken()`.
 * @returns {User} User record with e.g. `username` and `groups` keys.
 */
async function userFromTokens({idToken, accessToken, refreshToken}, client = undefined) {
  if (!idToken) throw new Error("missing idToken");
  if (!accessToken) throw new Error("missing accessToken");
  if (!refreshToken) throw new Error("missing refreshToken");

  /* Pull user information from the OIDC identity token, which is its intended
   * purpose.
   *
   * The OAuth2 access token¹ is for accessing other resources protected by the
   * IdP, such as the OIDC "user info" endpoint², but we don't currently use
   * it.  It is sometimes verifiable, depending on the IdP and authentication
   * flow, but not necessary (nor always possible) to do so in our use.³  We
   * treat it thus as an opaque blob, as suggested by the OAuth2 spec.¹
   *
   * Note that OAuth2 refresh tokens are opaque blobs never subject to
   * verification.
   *   -trs, 12 Oct 2023
   *
   * ¹ <https://datatracker.ietf.org/doc/html/rfc6749#section-1.4>
   *
   * ² <https://openid.net/specs/openid-connect-core-1_0.html#UserInfo>
   *   <https://docs.aws.amazon.com/cognito/latest/developerguide/userinfo-endpoint.html>
   *
   * ³ AWS Cognito documents its access tokens as JWTs and provides details for
   *   verifying them.  Azure AD's are also JWTs, but various details make
   *   generalized verification difficult (e.g. issuer is not the IdP we
   *   authenticate with).  Neither provides the OIDC "at_hash" claims in the
   *   id token that would let us treat the paired access token as an opaque
   *   but verifiable blob, as we're using the authorization code flow⁴ which
   *   does not require it.⁵
   *
   * ⁴ <https://openid.net/specs/openid-connect-core-1_0.html#Authentication>
   * ⁵ <https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowTokenValidation>
   */

  // Verifies idToken
  return await userFromIdToken(idToken, client);
}


/**
 * Creates a user record from the given `idToken` after verifying it.
 *
 * @param {String} idToken
 * @param {String|String[]} client. Optional. Passed to `verifyIdToken()`.
 * @returns {User} User record with e.g. `username` and `groups` keys.
 */
async function userFromIdToken(idToken, client = undefined) {
  const idClaims = await verifyIdToken(idToken, client);

  const {groups, authzRoles, flags, cognitoGroups} = parseCognitoGroups(idClaims[OIDC_GROUPS_CLAIM] || []);

  const user = {
    username: idClaims[OIDC_USERNAME_CLAIM],
    groups,
    authzRoles,
    flags,
    cognitoGroups,
  };
  return user;
}

/**
 * Parse an array of Cognito groups into a user's Nextstrain groups, their
 * authzRoles, and any flags.
 *
 * @returns {object} result
 * @returns {Group[]} result.groups - Nextstrain Groups of which this user is a member.
 * @returns {Set} result.authzRoles - Authorization roles granted to this user.
 * @returns {Set} result.flags - Flags on this user.
 */
function parseCognitoGroups(cognitoGroups) {
  /* Partition Cognito groups into those for "internal" usage and those
   * associated with roles for Nextstrain Groups (which are also "internal" in
   * some senses, but naming is hard).
   */
  const [internalGroups, nextstrainGroupsRoles] = partition(cognitoGroups, g => g.startsWith("!"));

  return {
    groups: [
      // Just the Nextstrain Group names (i.e. excluding the "/role" suffix)
      ...new Set(nextstrainGroupsRoles.map(g => splitGroupRole(g).group))
    ].map(name => {
      try {
        return new Group(name);
      } catch (error) {
        // Nextstrain Group does not exist for the Cognito group prefix
        return null;
      }
    }).filter(group => group !== null),

    authzRoles: new Set(nextstrainGroupsRoles),

    /* User flags
     */
    flags: new Set(
      internalGroups
        .filter(g => g.startsWith("!flags/"))
        .map(g => g.replace(/^!flags\//, ""))
    ),

    /* Preserving the original groups helps us just-in-time upgrade the user
     * object later (e.g. in deserializeUser) by calling (the updated version
     * of) this function again with this (original) array.
     */
    cognitoGroups,
  };
}

/**
 * User object.
 *
 * @typedef User
 * @type {object}
 * @property {string} username
 * @property {Group[]} groups - Nextstrain Groups of which this user is a member.
 * @property {Set} authzRoles - Authorization roles granted to this user.
 */


function splitGroupRole(cognitoGroup) {
  // I wish split("/", 1) worked reasonably.  -trs, 20 Dec 2021
  const [group, ...rest] = cognitoGroup.split("/");
  return {group, role: rest.join("/")};
}


/**
 * Verifies all aspects of the given OIDC `idToken` (a signed JWT from our AWS
 * Cognito user pool).
 *
 * Assertions about expected algorithms, audience, issuer, and token use follow
 * guidelines from
 * <https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html>.
 *
 * @param {String} idToken
 * @param {String} client. Optional `client_id` or list of `client_id`s
 *                 expected for the token. Defaults to this server's client id.
 * @returns {Object} Verified claims from the token's payload
 */
async function verifyIdToken(idToken, client = OAUTH2_CLIENT_ID) {
  const {payload: claims} = await jwtVerify(idToken, OIDC_JWKS, {
    algorithms: ["RS256"],
    issuer: OIDC_ISSUER_URL,
    audience: client,
  });

  /* AWS Cognito includes the kind of token, id or access, in the claims for
   * each token itself, e.g. so if you're expecting id tokens you can verify
   * someone handed you an id token and not an access token.  This presumably
   * helps block token misuse attacks, e.g. when code that's expecting an id
   * token is given an access token that looks close enough in terms of claims
   * but ends up breaking unasserted expections of the code and allowing an
   * authz bypass or privilege escalation.
   *
   * There is not, AFAICT, a standard claim for this information in OIDC, and
   * other IdPs don't provide it, so we only check this claim if it exists.
   *   -trs, 11 Oct 2023
   */
  const claimedUse = claims["token_use"];

  if (claimedUse !== undefined && claimedUse !== "id") {
    throw new JWTClaimValidationFailed(`unexpected "token_use" claim value: ${claimedUse}`, "token_use", "check_failed");
  }

  /* Verify the token was issued at (iat) a time more recent than our staleness
   * horizon for the user.
   */
  const username = claims[OIDC_USERNAME_CLAIM];

  if (!username) {
    throw new JWTClaimValidationFailed("missing username");
  }

  const staleBefore = await userStaleBefore(username);

  if (staleBefore) {
    if (typeof claims.iat !== "number") {
      throw new JWTClaimValidationFailed(`"iat" claim must be a number`, "iat", "invalid");
    }
    if (claims.iat + OIDC_IAT_BACKDATED_BY < staleBefore) {
      throw new AuthnTokenTooOld(`"iat" claim (plus any backdating) less than user's staleBefore: ${claims.iat} + ${OIDC_IAT_BACKDATED_BY} < ${staleBefore}`);
    }
  }

  return claims;
}


/**
 * Exchanges `refreshToken` for a new `idToken` and `accessToken` and possibly
 * `refreshToken`.
 *
 * The returned `refreshToken` will be identical to the passed in
 * `refreshToken` unless the IdP provides an updated one with the rest of the
 * tokens.  This is at the discretion of the IdP, see
 * {@link https://datatracker.ietf.org/doc/html/rfc6749#section-6}.
 *
 * @param {String} refreshToken
 * @returns {Object} tokens
 * @returns {String} tokens.idToken
 * @returns {String} tokens.accessToken
 * @returns {String} tokens.refreshToken
 * @throws {AuthnRefreshTokenInvalid} If the `refreshToken` is invalid,
 *   expired, revoked, or was issued to another client.  Existing tokens should
 *   be discarded if this error occurs as there is ~no way to recover from it
 *   except by initiating a new login.
 */
async function renewTokens(refreshToken) {
  const response = await fetch(OAUTH2_TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams([
      ["grant_type", "refresh_token"],
      ["client_id", OAUTH2_CLIENT_ID],
      ...(
        OAUTH2_CLIENT_SECRET
          ? [["client_secret", OAUTH2_CLIENT_SECRET]]
          : []
      ),
      ["refresh_token", refreshToken],
    ]),
  });

  const body = await response.text();

  switch (response.status) {
    case 200:
      break;

    case 400: {
      /* In the context of grant_type=refresh_token (above), the invalid_grant
       * error means¹:
       *
       *   [the] refresh token is invalid, expired, revoked, does not match the
       *   redirection URI used in the authorization request, or was issued to
       *   another client.
       *
       * as described by the OAuth 2.0 spec¹, which is referenced by the error
       * response section for the TOKEN endpoint² in the OpenID Connect Core
       * 1.0 spec, which is what Cognito implements here.
       *
       * All other 400 Bad Request errors are programming/service issues not
       * related to the refresh token itself, so fallthru to the default
       * generic error.
       *
       * ¹ RFC 6749 § 5.2: https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
       * ² https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.3.4
       */
      const {error, ...details} = JSON.parse(body);
      if (error === "invalid_grant") {
        throw new AuthnRefreshTokenInvalid(details);
      }
    }

    // eslint-disable-next-line no-fallthrough
    default:
      throw new Error(`failed to renew tokens: ${response.status} ${response.statusText}: ${body}`);
  }

  const {id_token: idToken, access_token: accessToken, refresh_token: refreshTokenUpdate} = JSON.parse(body);

  return {
    idToken,
    accessToken,
    refreshToken: refreshTokenUpdate ?? refreshToken,
  };
}


export {
  setup
};
