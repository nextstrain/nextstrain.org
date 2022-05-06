/**
 * User management.
 *
 * @module user
 */

const {REDIS} = require("./redis");


/**
 * Transient, in-memory "store" for userStaleBefore timestamps when Redis isn't
 * available (e.g. in local dev).
 */
const userStaleBeforeTransientStore = new Map();


/**
 * Get the "stale before" timestamp for the given user.
 *
 * User tokens issued before this timestamp should be considered stale: their
 * claims may not reflect the most current user information and they should be
 * renewed.
 *
 * @param {String} username
 * @returns {Number|null} timestamp
 * @see markUserStaleBeforeNow
 */
async function userStaleBefore(username) {
  const timestamp = REDIS
    ? parseInt(await REDIS.get(`userStaleBefore:${username}`), 10)
    : userStaleBeforeTransientStore.get(username);

  return Number.isInteger(timestamp)
    ? timestamp
    : null;
}


/**
 * Set the "stale before" timestamp for the given user to the current time.
 *
 * This timestamp should be set whenever the app makes a change to a user's
 * information in Cognito, such as modifying a user's group memberships or
 * updating a user's email address.
 *
 * @param {String} username
 * @returns {Boolean} True if set succeeded; false if not.
 * @see userStaleBefore
 */
async function markUserStaleBeforeNow(username) {
  const now = Math.ceil(Date.now() / 1000);
  if (REDIS) {
    /* The TTL must be greater than the maximum lifetime of an id/access token
     * or any other cached user data.  AWS Cognito limits the maximum lifetime
     * of id/access tokens to 24 hours, and those tokens are the only cached
     * user data we're using this timestamp for currently.  Set expiration to
     * 25 hours to avoid any clock jitter issues.
     *   -trs, 10 May 2022
     */
    const result = await REDIS.set(`userStaleBefore:${username}`, now, "EX", 25 * 60 * 60);
    return result === "OK";
  }
  userStaleBeforeTransientStore.set(username, now);
  return true;
}


module.exports = {
  userStaleBefore,
  markUserStaleBeforeNow,
};
