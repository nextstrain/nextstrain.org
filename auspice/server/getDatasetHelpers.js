const utils = require("./utils");

const handleError = (res, clientMsg, serverMsg="") => {
  res.statusMessage = clientMsg;
  utils.warn(`${clientMsg} -- ${serverMsg}`);
  return res.status(500).end();
};

const splitPrefixIntoParts = (url) => url
  .replace(/^\//, '')
  .replace(/\/$/, '')
  .split("/");

/* nextstrain.org only considers three sources: "live", "staging" and "community" */
const decideSourceFromPrefix = (prefix) => {
  let parts = splitPrefixIntoParts(prefix);
  if (parts[0] === "staging") {
    return "staging";
  }
  if (parts[0] === "community") {
    return "community";
  }
  return "live";
};

/* Given the prefix (split on "/") -- is there an exact match in
 * the available datasets? If not, we use these to pick the
 * "default" one.
 */
const correctPrefixFromAvailable = (source, prefixParts) => {

  if (!global.availableDatasets[source]) {
    utils.verbose("Cant compare against available datsets as there are none!");
    return prefixParts;
  }

  if (source === "staging" && prefixParts[0] !== "staging") {
    prefixParts.unshift("staging");
  }

  const doesPathExist = (pathToCheck) => {
    for (let i=0; i<global.availableDatasets[source].length; i++) {
      if (global.availableDatasets[source][i].request === pathToCheck) {
        utils.verbose(` ${pathToCheck} Matches an availible dataset`);
        return true;
      }
    }
    return false;
  };

  const removeStagingFromFront = (parts) => {
    if (parts[0] === "staging") parts.shift();
    return parts;
  };

  let prefix = prefixParts.join("/");

  if (doesPathExist(prefix)) {
    return removeStagingFromFront(prefixParts);
  }

  /* if we are here, then the path doesn't match any available datasets exactly */
  if (prefix in global.availableDatasets.defaults[source]) {
    prefix = `${prefix}/${global.availableDatasets.defaults[source][prefix]}`;
    const parts = prefix.split("/");
    if (doesPathExist(prefix)) {
      return removeStagingFromFront(parts);
    }
    return correctPrefixFromAvailable(source, parts);
  }

  return removeStagingFromFront(prefixParts);
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
const parsePrefix = (source, prefix, otherQueries) => {
  let auspiceDisplayUrl = ""; // the URL to be displayed in Auspice
  const fetchUrls = {};
  let treeName;
  let prefixParts = splitPrefixIntoParts(prefix);

  /* does the URL specify two trees? */
  let secondTreeName;
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

  if (source === "staging") {
    prefixParts = prefixParts.slice(1);
    auspiceDisplayUrl = "staging/";
  }
  prefixParts = correctPrefixFromAvailable(source, prefixParts);

  if (!treeName) {
    utils.verbose("Guessing tree name -- this should be improved");
    treeName = guessTreeName(prefixParts);
  }

  /* build the auspice display & server fetch URLs */
  const fetchPrefix =
    source === "staging" ? "http://staging.nextstrain.org" :
      source === "community" ? `https://raw.githubusercontent.com/${prefixParts[1]}/${prefixParts[2]}/master/auspice` :
        "http://data.nextstrain.org";
  auspiceDisplayUrl += prefixParts.join("/");
  const auspicePrefixParts = source === "community" ? prefixParts.slice(2) : prefixParts.slice();
  if (secondTreeName) {
    const idxOfTree = auspicePrefixParts.indexOf(treeName);
    const secondTreePrefixParts = auspicePrefixParts.slice();
    secondTreePrefixParts[idxOfTree] = secondTreeName;
    fetchUrls.secondTree = `${fetchPrefix}/${secondTreePrefixParts.join("_")}_tree.json`;
    const re = new RegExp(`\\/${treeName}(/|$)`); // note the double escape for special char
    auspiceDisplayUrl = auspiceDisplayUrl.replace(re, `/${treeName}:${secondTreeName}/`);
  }
  auspiceDisplayUrl = auspiceDisplayUrl.replace(/\/$/, ''); // remove any trailing slash

  fetchUrls.tree = `${fetchPrefix}/${auspicePrefixParts.join("_")}_tree.json`;
  fetchUrls.meta = `${fetchPrefix}/${auspicePrefixParts.join("_")}_meta.json`;

  if (otherQueries.type) {
    fetchUrls.additional = `${fetchPrefix}/${prefixParts.join("_")}_${otherQueries.type}.json`;
  }

  return ({fetchUrls, auspiceDisplayUrl, treeName, secondTreeName});

};


module.exports = {
  decideSourceFromPrefix,
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
