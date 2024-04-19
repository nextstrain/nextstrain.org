import { NotFound } from '../httpErrors.js';
import * as sources from '../sources/index.js';


/* Map old source "names" to their classes and vice versa to avoid dramatically
 * changing the functions below with the removal of source "names" elsewhere.
 *   -trs, 9 Feb 2022
 */
const sourceNameToClass = new Map([
  ["core", sources.CoreSource],
  ["staging", sources.CoreStagingSource],
  ["community", sources.CommunitySource],
  ["fetch", sources.UrlDefinedSource],
  ["groups", sources.GroupSource],
]);

const sourceClassToName = new Map(
  Array.from(sourceNameToClass.entries())
    .map(([name, class_]) => [class_, name])
);


/* All of the logic for mapping a dataset or narratives URL ("prefix") to a
 * source + path is intentionally encapsulated contained here.  This function
 * is essentially a router, and potentially should be refactored as such in the
 * future.
 *
 * The inverse of splitPrefixIntoParts() is joinPartsIntoPrefix(), which should
 * roundtrip losslessly.
 */
const splitPrefixIntoParts = (prefix) => {
  if (!prefix) throw new Error("'prefix' is null or empty");

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
      sourceName = prefixParts.shift();

      /* Swap the order of the first two elements if the second is
       * "narratives".  This turns
       *
       *   X/narratives/Y/Z → narratives/X/Y/Z
       *
       * where X is the group name.  It's a hack to account for
       *
       *   /groups/X/narratives/Y/Z vs. /community/narratives/X/Y/Z
       *
       * and the order the code below expects.
       */
      if (prefixParts[1] === "narratives") {
        prefixParts.splice(0, 2, prefixParts[1], prefixParts[0]);
      }
      break;
    default:
      sourceName = "core";
      break;
  }

  const isNarrative = prefixParts[0] === "narratives";

  if (isNarrative) {
    prefixParts.shift();
  }

  const Source = sourceNameToClass.get(sourceName);
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

    // Group source requires a group name
    case "groups":
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

  const sourceName = sourceClassToName.get(source.constructor);

  switch (sourceName) {
    case "community":
    case "staging":
    case "fetch":
      leadingParts.push(sourceName);
      break;

    case "groups":
      // groupName appears before "narratives", potentially added below
      leadingParts.push(sourceName, source.group.name);
      break;

    // no default
  }

  if (isNarrative) {
    leadingParts.push("narratives");
  }

  switch (sourceName) {
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


/* Round-trip prefix through split/join to canonicalize it for comparison.
 */
const canonicalizePrefix = async (prefix) =>
  joinPartsIntoPrefix(splitPrefixIntoParts(prefix));


export {
  splitPrefixIntoParts,
  joinPartsIntoPrefix,
  canonicalizePrefix,
};
