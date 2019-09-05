const utils = require("./utils");
const sources = require("./sources");

const handleError = (res, clientMsg, serverMsg="") => {
  res.statusMessage = clientMsg;
  utils.warn(`${clientMsg} -- ${serverMsg}`);
  return res.status(500).end();
};

const splitPrefixIntoParts = (prefix) => {
  const prefixParts = prefix
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .split("/");

  /* The first part of the prefix is an optional source name.  The rest is the
   * source path parts.
   */
  const sourceName = sources.has(prefixParts[0])
    ? prefixParts.shift()
    : "live";

  const source = sources.get(sourceName);

  return {source, prefixParts};
};

const joinPartsIntoPrefix = ({source, prefixParts}) =>
  source.name === "live"
    ? prefixParts.join("/")
    : [source.name, ...prefixParts].join("/");

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


const guessTreeName = (prefixParts) => {
  const guesses = ["HA", "NA", "PB1", "PB2", "PA", "NP", "NS", "MP", "L", "S"];
  for (const part of prefixParts) {
    if (guesses.indexOf(part.toUpperCase()) !== -1) return part;
  }
  return undefined;
};

/* Parse the prefix (normally URL) and decide which URLs to fetch etc
 * The prefix is case sensitive
 */
const parsePrefix = (prefix, otherQueries) => {
  const fetchUrls = {};
  let {source, prefixParts} = splitPrefixIntoParts(prefix);

  /* Does the URL specify two trees?
   *
   * If so, we need to extract the two tree names and massage the prefixParts
   * to only include the first.
   */
  let treeName, secondTreeName;
  for (let i=0; i<prefixParts.length; i++) {
    if (prefixParts[i].indexOf(":") !== -1) {
      [treeName, secondTreeName] = prefixParts[i].split(":");
      prefixParts[i] = treeName; // only use the first tree from now on
      break;
    }
  }
  if (!secondTreeName && otherQueries.deprecatedSecondTree) {
    secondTreeName = otherQueries.deprecatedSecondTree;
  }

  // Expand partial prefixes.  This would be cleaner if integerated into the
  // Source classes.
  prefixParts = correctPrefixFromAvailable(source.name, prefixParts);

  if (!treeName) {
    utils.verbose("Guessing tree name -- this should be improved");
    treeName = guessTreeName(prefixParts);
  }

  // The URL to be displayed in Auspice, tweaked below if necessary
  let auspiceDisplayUrl = joinPartsIntoPrefix({source, prefixParts});

  // Get the server fetch URLs
  const dataset = source.dataset(prefixParts);

  fetchUrls.tree = dataset.urlFor("tree");
  fetchUrls.meta = dataset.urlFor("meta");

  if (secondTreeName) {
    const idxOfTree = pathParts.indexOf(treeName);
    const secondTreePathParts = pathParts.slice();
    secondTreePathParts[idxOfTree] = secondTreeName;

    const secondDataset = source.dataset(secondTreePathParts);
    fetchUrls.secondTree = secondDataset.urlFor("tree");

    const re = new RegExp(`\\/${treeName}(/|$)`); // note the double escape for special char
    auspiceDisplayUrl = auspiceDisplayUrl.replace(re, `/${treeName}:${secondTreeName}/`);
  }
  auspiceDisplayUrl = auspiceDisplayUrl.replace(/\/$/, ''); // remove any trailing slash

  if (otherQueries.type) {
    fetchUrls.additional = dataset.urlFor(otherQueries.type);
  }

  return ({fetchUrls, auspiceDisplayUrl, treeName, secondTreeName, source});

};


module.exports = {
  splitPrefixIntoParts,
  joinPartsIntoPrefix,
  handleError,
  parsePrefix
};


/* Function to fetch unified JSON (meta+tree combined), and fallback to v1 jsons if this isn't found */
/* Currently not implemented as we don't have any v2 JSONs, but we will... */
// const fetchUnifiedJSON = (serverRes, source, path, pathTreeTwo, toInject, errorHandler) => {
//   const p = source === "local" ? utils.readFilePromise : utils.fetchJSON;
//   const pArr = [p(paths.fetchURL)];
//   if (paths.secondTreeFetchURL) {
//     pArr.push(p(paths.secondTreeFetchURL));
//   }
//   Promise.all(pArr)
//     .then((jsons) => {
//       const json = jsons[0]; // first is always the main JSON
//       for (const field in toInject) { // eslint-disable-line
//         json[field] = toInject[field];
//       }
//       if (paths.secondTreeFetchURL) {
//         json.treeTwo = jsons[1].tree;
//       }
//       res.json(json);
//     })
//     .catch(() => {
//       console.log("\tFailed to fetch unified JSON for", paths.fetchURL, "trying for v1...");
//       fetchV1JSONs.fetchTreeAndMetaJSONs(res, source, paths.fetchURL, paths.secondTreeFetchURL, toInject, errorHandler);
//     });
// }
