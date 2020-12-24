const utils = require("./utils");
const sources = require("./sources");

const handle500Error = (res, clientMsg, serverMsg="") => {
  utils.warn(`${clientMsg} -- ${serverMsg}`);
  return res.status(500).type("text/plain").send(clientMsg);
};

const unauthorized = (req, res) => {
  const user = req.user
    ? `user ${req.user.username}`
    : `an anonymous user`;

  utils.warn(`Denying ${user} access to ${req.originalUrl}`);
  return res.status(404).end();
};

/* All of the logic for mapping a dataset or narratives URL ("prefix") to a
 * source + path is intentionally encapsulated contained here.  This function
 * is essentially a router, and potentially should be refactored as such in the
 * future.
 *
 * The inverse of splitPrefixIntoParts() is joinPartsIntoPrefix(), which should
 * roundtrip losslessly.
 */
const splitPrefixIntoParts = (prefix) => {
  const prefixParts = prefix
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .split("/");

  /* The first part of the prefix is an optional source name.  The rest is the
   * source path parts.
   */
  let sourceName;

  switch (prefixParts[0]) {
    case "community":
    case "staging":
    case "fetch":
      sourceName = prefixParts.shift();
      break;
    case "groups":
      prefixParts.shift();
      sourceName = prefixParts.shift();
      break;
    default:
      sourceName = "core";
      break;
  }

  const isNarrative = prefixParts[0] === "narratives";

  if (isNarrative) {
    prefixParts.shift();
  }

  const Source = sources.get(sourceName);
  let source;

  switch (sourceName) {
    // Community source requires an owner and repo name
    case "community":
      source = new Source(...prefixParts.splice(0, 2));
      break;

    default:
      source = new Source();
  }

  return {source, prefixParts, isNarrative};
};

/* The inverse of splitPrefixIntoParts() above, intentionally written to mimic
 * that function's structure and roundtrip losslessly.
 *
 * If we move to a real router-based approach, this would ideally be an
 * automatically provided reverse URL-construction/interpolation function on
 * the matched route.
 */
const joinPartsIntoPrefix = ({source, prefixParts, isNarrative = false}) => {
  const leadingParts = [];

  switch (source.name) {
    case "core":
      break;
    case "community":
    case "staging":
    case "fetch":
      leadingParts.push(source.name);
      break;
    default:
      leadingParts.push("groups", source.name);
  }

  if (isNarrative) {
    leadingParts.push("narratives");
  }

  switch (source.name) {
    // Community source requires an owner and repo name
    case "community":
      leadingParts.push(source.owner, source.repoNameWithBranch);
      break;
    // no default
  }

  return [...leadingParts, ...prefixParts.filter((x) => x.length)].join("/");
};

/* Given the prefix (split on "/") -- is there an exact match in
 * the available datasets? If not, we use these to pick the
 * "default" one.
 */
const correctPrefixFromAvailable = (sourceName, prefixParts) => {
  // XXX FIXME: This should be consulting our source objects, not breaking
  // encapsulation by accessing the global directly.  Punting on that for now
  // as this work is time-sensitive.  I'll loop back around to it, though!
  //   -trs, 5 Sept 2019
  //
  if (!global.availableDatasets[sourceName]) {
    utils.verbose("Can't compare against available datasets as there are none!");
    return prefixParts;
  }

  const doesPathExist = (pathToCheck) =>
    global.availableDatasets[sourceName]
      .includes(pathToCheck);

  let prefix = prefixParts.join("/");

  if (doesPathExist(prefix)) {
    return prefixParts;
  }

  /* if we are here, then the path doesn't match any available datasets exactly */
  if (prefix in global.availableDatasets.defaults[sourceName]) {
    prefix = `${prefix}/${global.availableDatasets.defaults[sourceName][prefix]}`;
    const parts = prefix.split("/");
    if (doesPathExist(prefix)) {
      return parts;
    }
    return correctPrefixFromAvailable(sourceName, parts);
  }

  return prefixParts;
};


/* Parse the prefix (a path-like string specifying a source + dataset path)
 * with resolving of partial prefixes.  Prefixes are case-sensitive.
 */
const parsePrefix = (prefix) => {
  let {source, prefixParts} = splitPrefixIntoParts(prefix);

  // Expand partial prefixes.  This would be cleaner if integerated into the
  // Source classes.
  prefixParts = correctPrefixFromAvailable(source.name, prefixParts);

  // The resolved prefix, possibly "corrected" above, which we want to use for
  // display.
  const resolvedPrefix = joinPartsIntoPrefix({source, prefixParts});

  const dataset = source.dataset(prefixParts);

  return ({source, dataset, resolvedPrefix});

};


/* Round-trip prefix through split/join to canonicalize it for comparison.
 */
const canonicalizePrefix = (prefix) =>
  joinPartsIntoPrefix(splitPrefixIntoParts(prefix));


module.exports = {
  splitPrefixIntoParts,
  joinPartsIntoPrefix,
  handle500Error,
  unauthorized,
  parsePrefix,
  canonicalizePrefix,
};
