const {NotFound} = require("http-errors");

const sources = require("../sources");

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
  if (!Source) throw new NotFound();

  let source;

  switch (sourceName) {
    // Community source requires an owner and repo name
    case "community":
      source = new Source(...prefixParts.splice(0, 2));
      break;

    // UrlDefined source requires a URL authority part
    case "fetch":
      source = new Source(prefixParts.shift());
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
const joinPartsIntoPrefix = async ({source, prefixParts, isNarrative = false}) => {
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
      leadingParts.push(source.owner, await source.repoNameWithBranch());
      break;

    // UrlDefined source requires a URL authority part
    case "fetch":
      leadingParts.push(source.authority);
      break;

    // no default
  }

  return [...leadingParts, ...prefixParts.filter((x) => x.length)].join("/");
};


/* Parse the prefix (a path-like string specifying a source + dataset path)
 * with resolving of partial prefixes.  Prefixes are case-sensitive.
 */
const parsePrefix = async (prefix) => {
  const {source, prefixParts} = splitPrefixIntoParts(prefix);

  const dataset = source.dataset(prefixParts).resolve();

  // If prefixParts was partially-specified (an alias), we want to display the
  // resolved prefix.
  const resolvedPrefix = await joinPartsIntoPrefix({source, prefixParts: dataset.pathParts});

  return ({source, dataset, resolvedPrefix});
};


/* Round-trip prefix through split/join to canonicalize it for comparison.
 */
const canonicalizePrefix = async (prefix) =>
  joinPartsIntoPrefix(splitPrefixIntoParts(prefix));


module.exports = {
  splitPrefixIntoParts,
  joinPartsIntoPrefix,
  parsePrefix,
  canonicalizePrefix,
};
