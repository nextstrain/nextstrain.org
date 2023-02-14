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
 * @param {string} name - Variable name, e.g. "COGNITO_USER_POOL_ID"
 * @param {any} default - Final fallback value
 * @throws {Error} if no value is found and default is undefined
 */
const fromEnvOrConfig = (name, default_) => {
  const value =
       process.env[name]
    || configFile?.[name];

  if (!value && default_ === undefined) {
    throw new Error(`${name} is required (because default is undefined) but it was not found in the environment or config file (${CONFIG_FILE})`);
  }
  return value || default_;
};


/**
 * Id of our Cognito user pool.
 *
 * Required.
 *
 * @type {string}
 */
export const COGNITO_USER_POOL_ID = fromEnvOrConfig("COGNITO_USER_POOL_ID");


/**
 * Base URL (i.e. origin) of our Cognito user pool's hosted UI and OAuth2
 * endpoints.
 *
 * @type {string}
 */
export const COGNITO_BASE_URL = fromEnvOrConfig("COGNITO_BASE_URL");


/**
 * OAuth2 client id of nextstrain.org server as registered with our Cognito
 * user pool.
 *
 * @type {string}
 */
export const COGNITO_CLIENT_ID = fromEnvOrConfig("COGNITO_CLIENT_ID");


/**
 * OAuth2 client id of Nextstrain CLI as registered with our Cognito user pool.
 *
 * Used to identify its tokens provided via Bearer auth.
 *
 * @type {string}
 */
export const COGNITO_CLI_CLIENT_ID = fromEnvOrConfig("COGNITO_CLI_CLIENT_ID");
