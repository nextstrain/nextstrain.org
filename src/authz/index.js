import { strict as assert } from 'assert';
import { AuthzDenied } from '../exceptions.js';
import { Group } from "../groups.js";
import { Source, Resource } from '../sources/models.js';
import actions from './actions.js';
import tags from './tags.js';

/**
 * Checks if a user is allowed to take an action on an object.
 *
 * This is the main authorization routine called from throughout the codebase
 * (often via {@link assertAuthorized}).
 *
 * @param {module:../authn.User} user - Subject or principal doing the acting.
 * @param {Symbol} action - Action being taken, from {@link module:./actions}.
 * @param {object} object - Object being acted upon.
 * @returns {boolean}
 */
function authorized(user, action, object) {
  // user may be null
  assert(!user || user.authzRoles !== null, "user.authzRoles is not null if user is not null");
  assert(actions.has(action), "action is known");
  assert(object !== null, "object is not null");

  /* As a safe guard, anonymous users can only ever read, regardless of
   * policies right now.  We don't have any use cases right now where letting
   * anonymous users modify things is correct.
   */
  if (!user && action !== actions.Read) {
    return false;
  }

  /* Determine what policy is in force based on the object.  Currently we scope
   * policies to the source-level, but in the future we could easily adjust the
   * level at which policies reside and even combine multiple policies (e.g. a
   * policy from the source and a global policy).  The case table nicely
   * self-documents what kinds of objects we support here.
   *
   * I chose not to take the alternative, object-oriented approach of just
   * calling "object.authzPolicy" blindly and expecting "object" to determine
   * the policy in force itself, e.g. by Resources delegating to their
   * containing Source's authzPolicy.  That alternative approach also comes
   * with the pitfall/misfeature of easily permitting implementation of
   * per-dataset policies, which I think we want to avoid in favor of
   * per-dataset tags + higher-level policies (i.e. at Source/Group level)
   * which scope actions to those tags.  It could be worth reconsidering if
   * this case table grows out of hand, but I expect that to happen
   * approximately never.
   *    -trs, 4 Jan 2022
   */
  const policy =
    object instanceof Group    ? object.authzPolicy        :
    object instanceof Source   ? object.authzPolicy        :
    object instanceof Resource ? object.source.authzPolicy :
                                                      null ;

  const objectTags = object.authzTags;
  const userRoles = user ? user.authzRoles : new Set();

  return evaluatePolicy(policy, userRoles, action, objectTags);
}


/**
 * Evaluates *policy* using the given *userRoles*, *action*, and *objectTags*.
 *
 * Returns true when the policy permits and false otherwise.
 *
 * @param {Object[]} policy - Array of rules to evaluate.
 * @param {Set} userRoles - Roles of user taking action.
 * @param {Symbol} action - Action being taken, from {@link module:./actions}.
 * @param {Set} objectTags - Tags of object being acted upon.
 * @returns {boolean}
 */
function evaluatePolicy(policy, userRoles, action, objectTags) {
  assert(Array.isArray(policy));
  assert(policy.every(({tag, role, allow}) => tag && role && allow));
  assert(objectTags instanceof Set);
  assert(userRoles instanceof Set);
  assert(actions.has(action), "action is known");

  /* Policy rules apply to this (user, object) combo if the user roles and
   * object tags match those specified by the rule, or the rule uses a
   * wildcard.
   */
  const applicablePolicyRule = ({tag, role}) =>
       tag && role
    && (tag  === "*" || objectTags.has(tag))
    && (role === "*" || userRoles.has(role));

  /* If we need/want to support "deny" policy rules in the future, this is the
   * place to do it.
   *    -trs, 4 Jan 2022
   */
  const allowed = new Set(
    policy
      .filter(applicablePolicyRule)
      .flatMap(({allow}) => allow)
  );

  return allowed.has(action);
}


/**
 * Throws an exception if calling {@link authorized} with the given (user,
 * action, object) returns false.
 *
 * @param {module:../authn.User} user - Subject or principal doing the acting.
 * @param {Symbol} action - Action being taken, from {@link module:./actions}.
 * @param {object} object - Object being acted upon.
 * @throws {AuthzDenied}
 */
function assertAuthorized(user, action, object) {
  if (!authorized(user, action, object)) {
    throw new AuthzDenied();
  }
}


export {
  authorized,
  assertAuthorized,
  evaluatePolicy,

  actions,
  tags,
};
