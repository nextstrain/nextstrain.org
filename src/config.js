/**
 * Configuration variables for the nextstrain.org server.
 *
 * Values which aren't hardcoded are typically provided by environment
 * variables or config file fields of the same name.  Some variables have
 * hardcoded fallback values when neither the environment variable nor config
 * file field is present.
 *
 * See also {@link https://docs.nextstrain.org/projects/nextstrain-dot-org/page/infrastructure.html#environment-variables}.
 *
 * @module config
 */
import { readFile } from 'fs/promises';
import path, { dirname } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

import { fetch } from './fetch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __basedir = path.join(__dirname, "..");


/**
 * Running in production mode?
 *
 * Production mode means "in a production-like environment" and thus includes
 * anything on Heroku, including next.nextstrain.org, dev.nextstrain.org, and
 * PR review apps.
 *
 * @type {boolean}
 */
export const PRODUCTION = process.env.NODE_ENV === "production";


/**
 * Running as a Heroku Review app?
 *
 * These run in production mode but do not have access to sensitive information
 * (private S3 buckets, production Redis, production encryption keys, etc).
 *
 * See {@link https://devcenter.heroku.com/articles/github-integration-review-apps#injected-environment-variables}.
 *
 * @type {boolean}
 */
export const REVIEW_APP = !!process.env.HEROKU_PR_NUMBER;


/**
 * Path to a JSON file containing configuration values.
 *
 * Only some configuration variables will fall back from the environment to
 * values specified in this file.
 *
 * Defaults to env/production/config.json if {@link PRODUCTION} or
 * env/testing/config.json otherwise.
 *
 * @type {string}
 */
const CONFIG_FILE =
     process.env.CONFIG_FILE
  ?? path.join(__basedir, "env", (PRODUCTION ? "production" : "testing"), "config.json");

const configFile = CONFIG_FILE
  ? JSON.parse(await readFile(CONFIG_FILE))
  : null;


/**
 * Obtain a configuration variable from the environment or the config file.
 *
 * By default, values obtained from the environment will be deserialized from
 * JSON if possible.
 *
 * Optional conversion functions may be called on undefined values when there
 * is no value present in the environment or config file.
 *
 * Values are considered missing even when defined if they are an explicit null
 * or the empty string, e.g. X="null" (which is parsed as JSON) and X="" in the
 * environment are both treated the same as not defining X at all in the
 * environment.  The same applies to config file fields, e.g. {"X": null} and
 * {"X": ""}.
 *
 * @param {string} name - Variable name, e.g. "COGNITO_USER_POOL_ID"
 * @param {any} [default] - Final fallback value; if undefined then the variable is considered required.
 * @param {object} [options]
 * @param {function} [options.fromEnv] - conversion function to apply to values obtained from the environment; defaults to {@link maybeJSON}
 * @param {function} [options.fromConfig] - conversion function to apply to values obtained from the config file; defaults to the identity function
 * @throws {Error} if no value is found and default is undefined
 */
export const fromEnvOrConfig = (name, default_, {fromEnv = maybeJSON, fromConfig = x => x} = {}) => {
  const required = default_ === undefined;

  /* Missing means undefined, null, or the empty string and
   * ?? covers too little (only undefined and null) but
   * || covers too much (0, false, etc.)
   * so convert to null and then use ??.
   */
  const nullIfMissing = value => missing(value) ? null : value;

  const value =
       nullIfMissing(fromEnv(process.env[name]))
    ?? nullIfMissing(fromConfig(configFile?.[name]))
    ?? default_;

  if (required && missing(value)) {
    throw new Error(`${name} is required (because default is undefined) but it was not found in the environment or config file (${CONFIG_FILE})`);
  }
  return value;
};


/**
 * Missing means undefined, null, or the empty string.
 *
 * @param {any} value
 * @returns {boolean}
 */
function missing(value) {
  return value === undefined || value === null || value === "";
}


/**
 * Deserialize a value that might be JSON, passing it thru if it isn't.
 *
 * @param {any} x - Value which might be JSON
 */
function maybeJSON(x) {
  if (typeof x === "string") {
    try {
      return JSON.parse(x);
    } catch (e) {
      // no worries
    }
  }
  return x;
}

/**
 * Resolve a value as a filesystem path relative to {@link CONFIG_FILE}.
 *
 * Values which are null or undefined are passed thru.
 *
 * @param {?string} value - relative or absolute path
 * @returns {?string} absolute path
 * @throws {Error} if {@link CONFIG_FILE} is not set
 */
function configPath(value) {
  if (!CONFIG_FILE)
    throw new Error(`configPath() called without CONFIG_FILE set`);

  // Don't path.resolve() on a missing value
  if (missing(value))
    return;

  return path.resolve(path.dirname(CONFIG_FILE), value);
}


/**
 * AWS region to use for services where it's not otherwise specified.
 *
 * Currently, this should be the region where the S3 buckets live as the region
 * for the Cognito user pool is embedded in its id.
 *
 * If unspecified, then the AWS SDK's own logic for determining region is used.
 * In practice, that means the standard AWS config file (since the SDK also
 * looks at the AWS_REGION environment variable).
 *
 * @type {string}
 */
export const AWS_REGION = fromEnvOrConfig("AWS_REGION", null);


/**
 * Id of our Cognito user pool.
 *
 * Required for the following endpoints to be available:
 *
 *     /groups/{name}/settings/members
 *     /groups/{name}/settings/roles/{role}/members
 *     /groups/{name}/settings/roles/{role}/members/{username}
 *
 * Otherwise, they'll return 503 Service Unavailable.
 *
 * @type {string}
 */
export const COGNITO_USER_POOL_ID = fromEnvOrConfig("COGNITO_USER_POOL_ID", null);


/**
 * URL of the OIDC IdP for our user directory (e.g. our Cognito user pool's
 * hosted UI and OAuth2 endpoints).
 *
 * Required.
 *
 * @type {string}
 */
export const OIDC_IDP_URL = fromEnvOrConfig("OIDC_IDP_URL");


/**
 * OpenID Connect (OIDC) identity provider configuration document.
 *
 * Typically this is unspecified in the environment or config file and instead
 * populated by fetching it from the OIDC IdP.
 *
 * Refer to the spec for the
 * {@link https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata core metadata fields}
 * and the
 * {@link https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#authorization-server-metadata IANA metadata field registry}
 * for references to other fields.
 *
 * @type {object}
 */
export const OIDC_CONFIGURATION = fromEnvOrConfig("OIDC_CONFIGURATION", await oidcConfiguration(OIDC_IDP_URL));

async function oidcConfiguration(idpUrl) {
  const url = `${idpUrl}/.well-known/openid-configuration`;
  const response = await fetch(url);

  if (!response.ok) {
    console.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}: ${await response.text()}`);
    return;
  }
  return await response.json();
}

/** "issuer" metadata field in OIDC configuration */
export const OIDC_ISSUER_URL = fromEnvOrConfig("OIDC_ISSUER_URL", OIDC_CONFIGURATION.issuer);

/** "jwks_uri" metadata field in OIDC configuration */
export const OIDC_JWKS_URL = fromEnvOrConfig("OIDC_JWKS_URL", OIDC_CONFIGURATION.jwks_uri);

/** "authorization_endpoint" metadata field in OIDC configuration */
export const OAUTH2_AUTHORIZATION_URL = fromEnvOrConfig("OAUTH2_AUTHORIZATION_URL", OIDC_CONFIGURATION.authorization_endpoint);

/** "token_endpoint" metadata field in OIDC configuration */
export const OAUTH2_TOKEN_URL = fromEnvOrConfig("OAUTH2_TOKEN_URL", OIDC_CONFIGURATION.token_endpoint);

/** "end_session_endpoint" metadata field in OIDC configuration with RP-initiated logout support {@link https://openid.net/specs/openid-connect-rpinitiated-1_0.html#OPMetadata} */
export const OAUTH2_LOGOUT_URL = fromEnvOrConfig("OAUTH2_LOGOUT_URL", OIDC_CONFIGURATION.end_session_endpoint);

/** "scopes_supported" metadata field in OIDC configuration */
export const OAUTH2_SCOPES_SUPPORTED = new Set(fromEnvOrConfig("OAUTH2_SCOPES_SUPPORTED", OIDC_CONFIGURATION.scopes_supported));


/**
 * Effective OpenID Connect (OIDC) identity provider configuration document
 * after potential local overrides.
 *
 * Defined here to keep the overridden fields close to their declarations
 * above.
 */
export const EFFECTIVE_OIDC_CONFIGURATION = {
  ...OIDC_CONFIGURATION,
  issuer: OIDC_ISSUER_URL,
  jwks_uri: OIDC_JWKS_URL,
  authorization_endpoint: OAUTH2_AUTHORIZATION_URL,
  token_endpoint: OAUTH2_TOKEN_URL,
  end_session_endpoint: OAUTH2_LOGOUT_URL,
  scopes_supported: OAUTH2_SCOPES_SUPPORTED,
};


/**
 * OAuth2 client id of nextstrain.org server as registered with our IdP (e.g.
 * our Cognito user pool).
 *
 * Required.
 *
 * @type {string}
 */
export const OAUTH2_CLIENT_ID = fromEnvOrConfig("OAUTH2_CLIENT_ID");


/**
 * Optional OAuth2 client secret corresponding to the {@link OAUTH2_CLIENT_ID}.
 *
 * @type {string}
 * @default null
 */
export const OAUTH2_CLIENT_SECRET = fromEnvOrConfig("OAUTH2_CLIENT_SECRET", null);


/**
 * OAuth2 client id of Nextstrain CLI as registered with our IdP (e.g. Cognito
 * user pool).
 *
 * Used to identify its tokens provided via Bearer auth.
 *
 * Required.
 *
 * @type {string}
 */
export const OAUTH2_CLI_CLIENT_ID = fromEnvOrConfig("OAUTH2_CLI_CLIENT_ID");


/**
 * OAuth2 client redirect URIs (e.g. callback URLs) for Nextstrain CLI as
 * registered with the IdP.
 *
 * These URLs are not themselves used by the server but are provided to
 * (discovered by) Nextstrain CLI in a client configuration section of the
 * OpenID configuration document served at /.well-known/openid-configuration.
 *
 * The name of this config var uses "redirect_uri" as the term since that's the
 * literal field name used by the OIDC/OAuth2 specs in several places (initial
 * auth requests, client metadata registration/querying, etc.).
 *
 * @type {string[]}
 */
export const OAUTH2_CLI_CLIENT_REDIRECT_URIS = fromEnvOrConfig("OAUTH2_CLI_CLIENT_REDIRECT_URIS");


/**
 * ID token claim field containing the username for a user.
 *
 * Required.
 *
 * @type {string}
 */
export const OIDC_USERNAME_CLAIM = fromEnvOrConfig("OIDC_USERNAME_CLAIM");


/**
 * ID token claim field containing the list of role group names for a user.
 *
 * Required.
 *
 * @type {string}
 */
export const OIDC_GROUPS_CLAIM = fromEnvOrConfig("OIDC_GROUPS_CLAIM");


/**
 * Fixed time (in seconds) by which the IdP backdates the "iat" claim of the ID
 * token.
 *
 * @type {number}
 * @default 0
 */
export const OIDC_IAT_BACKDATED_BY = fromEnvOrConfig("OIDC_IAT_BACKDATED_BY", 0);

if (typeof OIDC_IAT_BACKDATED_BY !== 'number') {
  throw new Error(`OIDC_IAT_BACKDATED_BY value is not a number; got "${OIDC_IAT_BACKDATED_BY}"`);
}


/**
 * Domain attribute to use for the session cookie.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#domaindomain-value}.
 *
 * Defaults to no domain (null), which means the session cookie will be
 * host-only.  This is typically what's desired.
 *
 * @type {string}
 * @default null
 */
export const SESSION_COOKIE_DOMAIN = fromEnvOrConfig("SESSION_COOKIE_DOMAIN", null);


/**
 * Secret(s) used to sign the session ids stored in session cookies.
 *
 * May be an array of strings to allow secret rotation over time.  The first
 * secret should be the current secret, the one used for signing; others are
 * old secrets to still accept for signature verification.
 *
 * Required if {@link PRODUCTION}, optional otherwise.
 *
 * @type {string|string[]}
 */
export const SESSION_SECRET = fromEnvOrConfig("SESSION_SECRET", PRODUCTION ? undefined : "BAD SECRET FOR DEV ONLY");


/**
 * Maximum age for the session cookie, in seconds.
 *
 * Expiration of session cookies is rolling, so making any request resets the
 * cookie expiration date to the current time plus this value.
 *
 * @type {number}
 * @default 2592000 (30 days, in seconds)
 */
export const SESSION_MAX_AGE = fromEnvOrConfig("SESSION_MAX_AGE", 30 * 24 * 60 * 60); // 30d in seconds


/**
 * Flag indicating if Redis (via REDIS_URL) is required.
 *
 * Defaults to true if {@link PRODUCTION} and not {@link REVIEW_APP}, otherwise
 * false.
 *
 * @type {boolean}
 */
/* XXX TODO: Provision lowest-tier Heroku Redis addon for review apps and
 * remove the !REVIEW_APP condition.
 *
 * Heroku has good support for this, but to enable it I think we need to switch
 * how we configure review apps.  Currently they're configured via the Heroku
 * Dashboard¹.  I think we need to switch to the app.json file² instead, as
 * described in the review app documentation.³
 *   -trs, 12 Oct 2023
 *
 * ¹ <https://dashboard.heroku.com/pipelines/38f67fc7-d93c-40c6-a182-501da2f89d9d/settings>
 * ² <https://devcenter.heroku.com/articles/app-json-schema>
 * ³ <https://devcenter.heroku.com/articles/github-integration-review-apps>
 */
export const REDIS_REQUIRED = fromEnvOrConfig("REDIS_REQUIRED", PRODUCTION && !REVIEW_APP);


/**
 * Path to a JSON file containing Groups data.
 *
 * If sourced from the config file, relative paths are resolved relative to the
 * directory containing the config file.
 *
 * Required.
 *
 * @type {string}
 */
export const GROUPS_DATA_FILE = fromEnvOrConfig("GROUPS_DATA_FILE", undefined, {fromConfig: configPath});


/**
 * Name of the S3 bucket to use for Nextstrain Groups storage.
 *
 * The layout of objects in the bucket will be like so:
 *
 *   ${bucketName}/
 *     ${groupNameA}/
 *       group-logo.png
 *       group-overview.md
 *       datasets/
 *         ${datasetName}.json
 *         ${datasetName}_${sidecarType}.json
 *         …
 *       narratives/
 *         ${narrativeName}.md
 *         …
 *     ${groupNameB}/
 *       …
 *     …
 *
 *
 * @type {string}
 * @default nextstrain-groups
 */
export const GROUPS_BUCKET = fromEnvOrConfig("GROUPS_BUCKET", "nextstrain-groups");


/**
 * Location of the JSON file to be used as the resource collection index. Can be
 * a S3 address or a local filepath, if S3 then the file must be gzipped.
 *
 * If sourced from the config file, relative paths are resolved relative to the
 * repo root directory ("nextstrain.org").
 *
 * Falsey values result in the resource collection functionality not being used.
 */
export const RESOURCE_INDEX = fromEnvOrConfig("RESOURCE_INDEX", null);

/**
 * The nextJs route handler can operate in dev mode (hot reloading etc) or in
 * production mode where it serves pre-compiled assets (created via `npx next
 * build`). A common development aim is to test using pre-compiled assets
 * without the overhead of running the entire nextstrain.org server in
 * production mode.
 *
 * The reverse is not true - there's no need to run static-site in dev mode
 * and the overall site in production mode - and that configuration is prevented
 * here.
 *
 * There is a side-effect to this - if the nextJsApp is set up in "production"
 * mode it will re-set `NODE_ENV=production`. This will have undesired
 * side-effects if any of our code inspects that variable rather than using the
 * canonical PRODUCTION flag set here. 
 */
export const STATIC_SITE_PRODUCTION = PRODUCTION || !!process.env.USE_PREBUILT_STATIC_SITE;

/**
 * Domain in Plausible analytics for which to record server-side analytics
 * events.
 *
 * Analytics are not recorded if this is not set.
 */
export const PLAUSIBLE_ANALYTICS_DOMAIN = fromEnvOrConfig("PLAUSIBLE_ANALYTICS_DOMAIN", null);

/**
 * URL of submission endpoint for Plausible analytics events.
 *
 * Defaults to Plausible's standard endpoint.  Useful to change during
 * development and testing of analytics.
 */
export const PLAUSIBLE_ANALYTICS_ENDPOINT = fromEnvOrConfig("PLAUSIBLE_ANALYTICS_ENDPOINT", "https://plausible.io/api/event");
