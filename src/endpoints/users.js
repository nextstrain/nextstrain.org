import * as authz from '../authz/index.js';
import { ALL_GROUPS } from '../groups.js';
import { contentTypesProvided } from '../negotiate.js';
import * as nextJsApp from './nextjs.js';


/**
 * Returns an array of Nextstrain groups that are visible to a
 * given *user* (or a non-logged in user). The order of groups returned
 * matches the order in the `groups.json` data file.
 *
 * @param {Object | undefined} user. `undefined` represents a non-logged-in user
 * @returns {Array} Each element is an object with keys `name` -> {str} (group name) and
 *                  `private` -> {bool} (group is private)
 */
const visibleGroups = (user) => ALL_GROUPS
  .map(g => [g.name, g.source])
  .filter(([, source]) => authz.authorized(user, authz.actions.Read, source))
  .map(([name, source]) => ({
    name,
    private: !authz.authorized(null, authz.actions.Read, source),
  }));


/**
 * Returns an array of Nextstrain groups that a given *user* is a member of.
 *
 * @param {Object | undefined} user. `undefined` represents a non-logged-in user
 * @returns {Array} Each element represents a group with a a subset of properties from
 *                  the Group class.
 */
const groupMemberships = (user) => user?.groups
  ?.map(group => ({
     name: group.name,
     isPublic: group.isPublic,
  }))
  ?? []
;


// Provide the client-side app with info about the current user
const getWhoami = contentTypesProvided([
  ["html", (req, res) => {
    // A bug¹ in the Next.js handler drops the Vary header set by
    // contentTypesProvided(). Set a no-cache header to prevent Next.js from
    // adding its permissive default, which would cause shared (CDN) caches to
    // potentially serve HTML to JSON requests.
    // TODO: remove once the Next.js bug is fixed.
    // ¹ <https://github.com/vercel/next.js/issues/85999>
    res.set("Cache-Control", "private, no-cache");
    return nextJsApp.handleRequest(req, res);
}],
  ["json", (req, res) =>
    // Express's JSON serialization drops keys with undefined values
    res.json({
      user: req.user || null,
      visibleGroups: visibleGroups(req.user),
      groupMemberships: groupMemberships(req.user),
    })
  ],
]);


export {
  getWhoami,
};
