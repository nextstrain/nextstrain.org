/**
 * User management.
 *
 * @module user
 */

import { KvNamespace } from "./kv.js";


const staleBefore = new KvNamespace("userStaleBefore");


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
  const timestamp = parseInt(await staleBefore.get(username), 10);

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
  /* Keying on usernames, instead of say the "sub" (subject) attribute of a
   * user, makes this API more ergonomic and avoids needing to convert from
   * username → sub in contexts where we only have username (e.g. a request
   * from the group owner to modify the membership role of another user in the
   * group).  One pitfall of usernames is that they can be re-used after
   * deletion (unlike "sub" values), but that is not a concern for this "stale
   * before" functionality.
   *
   * We can always convert this to use "sub" in the future if we think it's
   * worth it and are already taking the hit of a Cognito ListUsers API call
   * for other needs.
   *   -trs, 8 June 2022
   */
  const now = Math.ceil(Date.now() / 1000);

  /* The TTL must be greater than the maximum lifetime of an id/access token
   * or any other cached user data.  AWS Cognito limits the maximum lifetime
   * of id/access tokens to 24 hours, and those tokens are the only cached
   * user data we're using this timestamp for currently.  Set expiration to
   * 25 hours to avoid any clock jitter issues.
   *   -trs, 10 May 2022
   */
  const ttl = 25 * 60 * 60 * 1000; // milliseconds

  return await staleBefore.set(username, now, ttl);
}


export {
  userStaleBefore,
  markUserStaleBeforeNow,
};
