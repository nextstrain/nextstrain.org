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
      sourceName = prefixParts.shift();
      break;
    case "groups":
      prefixParts.shift();
      sourceName = prefixParts.shift();
      break;
    case "fetch":
      /* the `/fetch/ URLs are backed by the `UrlDefinedSource` as `FetchSource` was too confusing */
      prefixParts.shift();
      sourceName = "urlDefined";
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
      leadingParts.push(source.name);
      break;
    case "urlDefined":
      leadingParts.push("fetch");
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


/* Parse the prefix (normally URL) and decide which URLs to fetch etc
 * The prefix is case sensitive
 */
const parsePrefix = (prefix, otherQueries) => {
  const fetchUrls = {};
  let {source, prefixParts} = splitPrefixIntoParts(prefix);

  // Expand partial prefixes.  This would be cleaner if integerated into the
  // Source classes.
  prefixParts = correctPrefixFromAvailable(source.name, prefixParts);

  // The URL to be displayed in Auspice
  const auspiceDisplayUrl = joinPartsIntoPrefix({source, prefixParts});

  // Get the server fetch URLs
  const dataset = source.dataset(prefixParts);

  fetchUrls.main = dataset.urlFor("main");
  fetchUrls.tree = dataset.urlFor("tree");
  fetchUrls.meta = dataset.urlFor("meta");

  if (otherQueries.type) {
    fetchUrls.additional = dataset.urlFor(otherQueries.type);
  }

  return ({fetchUrls, auspiceDisplayUrl, source, dataset});

};


module.exports = {
  splitPrefixIntoParts,
  joinPartsIntoPrefix,
  handle500Error,
  unauthorized,
  parsePrefix
};
