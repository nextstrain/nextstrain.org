const {contentTypesProvided} = require("../negotiate");
const sources = require("../sources");
const {sendGatsbyPage} = require("./static");


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
  .filter(([, Source]) => Source.isGroup())
  .filter(([, Source]) => Source.visibleToUser(user))
  .map(([sourceName, Source]) => ({
    name: sourceName,
    private: !Source.visibleToUser(undefined)
  }));


// Provide the client-side app with info about the current user
const getWhoami = contentTypesProvided([
  ["html", sendGatsbyPage("whoami/index.html")],
  ["json", (req, res) =>
    // Express's JSON serialization drops keys with undefined values
    res.json({
      user: req.user || null,
      visibleGroups: visibleGroups(req.user),
    })
  ],
]);


module.exports = {
  getWhoami,
};
