import { readFileSync } from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { ResourceIndexerError } from "./errors.js";
import { convertManifestJsonToAvailableDatasetList } from "../src/endpoints/charon/parseManifest.js";
import { datasetRedirects } from "../src/redirects.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __basedir = path.join(__dirname, "..");

let resolvedPath;

/**
 * Remaps an incomplete URL core dataset path to the path it will be redirected
 * to by the server via the "nextstrain manifest". If the provided URL would not
 * be redirected we return the provided path unchanged.
 * @param {string} urlPath nextstrain.org URL path
 * @returns {string}
 */
export const remapCoreUrl = (urlPath) => {
  if (!resolvedPath) {
    /* map only computed the first time this function is run */
    const serverManifest = JSON.parse(readFileSync(path.join(__basedir, "data", "manifest_core.json")));
    resolvedPath = resolveAll(
      convertManifestJsonToAvailableDatasetList(serverManifest).defaults
    )
    console.log(resolvedPath)
  }
  return resolvedPath[urlPath] || urlPath;
}


/**
 * The server redirects core dataset URLs via two (complementary) approaches.
 * 
 * First, there is a set of hardcoded redirects (src/redirects.js), as exposed by
 * the `datasetRedirects` function.
 * 
 * Secondly, we use our own "manifest JSON" to compute a map of partial paths
 * and their next (default) path,
 * e.g. flu → seasonal
 *      flu/seasonal → h3n2
 *      etc
 * and uses an iterative approach to resolve the final path. Here we want to
 * resolve the entire path for every partial path, for instance
 *      flu → flu/seasonal/h3n2/h2/2y
 *      flu/seasonal → flu/seasonal/h3n2/h2/2y
 * 
 * This function combines those approaches and returns a complete list of
 * URL paths and the final URL path they would be redirected to.
 * @param {Object} defaults 
 * @returns {Object}
 */
function resolveAll(defaults) {
  const urlMap = {};

  Object.entries(defaults).forEach(([partialPath, nextPathPart]) => {
    if (partialPath==='') return; // manifest has a base default of zika!
    let resolvedPath = `${partialPath}/${nextPathPart}`;
    while (resolvedPath in defaults) {
      resolvedPath += `/${defaults[resolvedPath]}`;
    }
    urlMap[partialPath] = resolvedPath;
  })

  /**
   * Process server-hardcoded dataset redirects after the above defaults, as the
   * path we redirect to may itself be further redirected by the defaults.
   */
  const redirects = datasetRedirects().map((paths) => paths.map(_removeSlashes));
  for (const [requestUrlPath, redirectUrlPath] of redirects) {
    // The datasetRedirects are simple paths, with no version descriptors or
    // queries or patterns/regex like behaviour. Nonetheless it's prudent
    // to add some basic checks for these
    if (requestUrlPath.includes('@') || requestUrlPath.includes(':') || requestUrlPath.includes('?')) {
      throw new ResourceIndexerError(`Hardcoded server redirect '${requestUrlPath}' is invalid.`);
    }
    urlMap[requestUrlPath] = urlMap[redirectUrlPath] || redirectUrlPath;
  }

  return urlMap;
}

/**
 * Remove any leading & trailing slashes
 */
function _removeSlashes(path) {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}