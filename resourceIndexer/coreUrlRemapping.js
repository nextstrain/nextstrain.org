import { readFileSync } from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { convertManifestJsonToAvailableDatasetList } from "../src/endpoints/charon/parseManifest.js";

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
  }
  return resolvedPath[urlPath] || urlPath;
}


/**
 * The server contains a map of partial paths and their next (default) path,
 * e.g. flu → seasonal
 *      flu/seasonal → h3n2
 *      etc
 * and uses an iterative approach to resolve the final path. Here we want to
 * resolve the entire path for every partial path, for instance
 *      flu → flu/seasonal/h3n2/h2/2y
 *      flu/seasonal → flu/seasonal/h3n2/h2/2y
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
  return urlMap;
}
