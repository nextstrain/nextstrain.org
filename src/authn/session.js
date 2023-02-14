import { PRODUCTION } from '../config.js';
import { keyringFromParamString, encrypt, decrypt, randomKey } from '../cryptography.js';


const SESSION_ENCRYPTION_KEYS = process.env.SESSION_ENCRYPTION_KEYS;

if (PRODUCTION && !SESSION_ENCRYPTION_KEYS) {
  throw new Error("SESSION_ENCRYPTION_KEYS required in production mode");
}

const KEYRING = keyringFromParamString(SESSION_ENCRYPTION_KEYS || `RANDOM=${randomKey()}`);


/**
 * Decrypts and returns the encrypted tokens stored in the given session
 * object.
 *
 * If there are no tokens in the session, then returns null.
 *
 * @param {Object} session - typically req.session
 * @returns {{idToken, accessToken, refreshTokens}|null}
 */
async function getTokens(session) {
  if (session?.encryptedTokens) {
    const context = {sid: session.id};
    const decryptedTokens = JSON.parse(await decrypt(KEYRING, session.encryptedTokens, context));

    // Return just the three tokens, regardless of other keys that might be present.
    const {idToken, accessToken, refreshToken} = decryptedTokens;
    return {idToken, accessToken, refreshToken};
  }
  return null;
}


/**
 * Encrypts and stores the given tokens in the given session object.
 *
 * If the tokens object is null, then any existing tokens in the session object
 * are removed.
 *
 * @param {Object} session - typically req.session
 * @param {{idToken, accessToken, refreshTokens}|null} tokens - if null, removes any existing tokens from the session
 */
async function setTokens(session, tokens) {
  if (tokens) {
    /* Encryption context to bind this message to this session.  For example,
     * this prevents coyping of the encrypted tokens from one session to
     * another.
     */
    const context = {sid: session.id};

    // Set just the three tokens, regardless of other keys that might be present.
    const {idToken, accessToken, refreshToken} = tokens;

    session.encryptedTokens = await encrypt(KEYRING, JSON.stringify({
      idToken,
      accessToken,
      refreshToken,
    }), context);
  } else {
    delete session.encryptedTokens;
  }
}


/**
 * Removes any existing tokens stored in the given session object.
 *
 * Equivalent to `setTokens(session, null)`.
 *
 * @param {Object} session - typically req.session
 */
async function deleteTokens(session) {
  return await setTokens(session, null);
}


export {
  getTokens,
  setTokens,
  deleteTokens,
};
