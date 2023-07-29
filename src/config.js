/**
 * Configuration variables for the nextstrain.org server.
 *
 * Values which aren't hardcoded are typically provided by environment
 * variables of the same name.  Some variables have hardcoded fallback values
 * when the environment variable is missing or empty.
 *
 * See also {@link https://docs.nextstrain.org/projects/nextstrain-dot-org/page/infrastructure.html#environment-variables}.
 *
 * @module config
 */
import { readFile } from 'fs/promises';
import fetch from 'node-fetch';
import path, { dirname } from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

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
 * Values obtained from the environment will be deserialized from JSON if
 * possible.
 *
 * @param {string} name - Variable name, e.g. "COGNITO_USER_POOL_ID"
 * @param {any} default - Final fallback value
 * @throws {Error} if no value is found and default is undefined
 */
const fromEnvOrConfig = (name, default_) => {
  const value =
       maybeJSON(process.env[name])
    || configFile?.[name];

  if (!value && default_ === undefined) {
    throw new Error(`${name} is required (because default is undefined) but it was not found in the environment or config file (${CONFIG_FILE})`);
  }
  return value || default_;
};


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
 * Id of our Cognito user pool.
 *
 * Required.
 *
 * @type {string}
 */
export const COGNITO_USER_POOL_ID = fromEnvOrConfig("COGNITO_USER_POOL_ID");


/**
 * URL of the OIDC IdP for our user directory (e.g. our Cognito user pool's
 * hosted UI and OAuth2 endpoints).
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

/** "issuer" metadata field in  */
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
 * OAuth2 client id of nextstrain.org server as registered with our IdP (e.g.
 * our Cognito user pool).
 *
 * @type {string}
 */
export const OAUTH2_CLIENT_ID = fromEnvOrConfig("OAUTH2_CLIENT_ID");


/**
 * Optional OAuth2 client secret corresponding to the {@link OAUTH2_CLIENT_ID}.
 *
 * @type {string}
 */
export const OAUTH2_CLIENT_SECRET = fromEnvOrConfig("OAUTH2_CLIENT_SECRET", null);


/**
 * OAuth2 client id of Nextstrain CLI as registered with our IdP (e.g. Cognito
 * user pool).
 *
 * Used to identify its tokens provided via Bearer auth.
 *
 * @type {string}
 */
export const OAUTH2_CLI_CLIENT_ID = fromEnvOrConfig("OAUTH2_CLI_CLIENT_ID");


/**
 * ID token claim field containing the username for a user.
 *
 * @type {string}
 */
export const OIDC_USERNAME_CLAIM = fromEnvOrConfig("OIDC_USERNAME_CLAIM");


/**
 * ID token claim field containing the list of role group names for a user.
 *
 * @type {string}
 */
export const OIDC_GROUPS_CLAIM = fromEnvOrConfig("OIDC_GROUPS_CLAIM");


/**
 * Path to a JSON file containing Groups data.
 *
 * Defaults to env/production/groups.json if {@link PRODUCTION} or
 * env/testing/groups.json otherwise.
 *
 * @type {string}
 */
export const GROUPS_DATA_FILE =
     process.env.GROUPS_DATA_FILE
  ?? path.join(__basedir, "env", (PRODUCTION ? "production" : "testing"), "groups.json");
