import { readFileSync } from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { convertManifestJsonToAvailableDatasetList } from "../src/endpoints/charon/parseManifest.js";
import { updateDatasetUrl } from "../src/redirects.js";

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

  /**
   * Process server-hardcoded dataset redirects before the defaults, as the
   * path we redirect to may itself be further redirected by the defaults.
   * e.g. redirects monkeypox -> mpox, core routing redirects mpox -> mpox/clade-IIb
   * Requires a leading slash to match the paths expected in server.
   */
  const serverRedirectedUrlPath = _removeSlashes(updateDatasetUrl(`/${urlPath}`))
  return resolvedPath[serverRedirectedUrlPath] || serverRedirectedUrlPath
}


/**
 * Use our own "manifest JSON" to compute a map of partial paths
 * and their next (default) path,
 * e.g. seasonal-flu → h3n2
 *      seasonal-flu/h3n2 → h2
 *      etc
 * and uses an iterative approach to resolve the final path. Here we want to
 * resolve the entire path for every partial path, for instance
 *      seasonal-flu → seasonal-flu/h3n2/h2/2y
 *      seasonal-flu/h3n2 → seasonal-flu/h3n2/h2/2y
 *
 * This function returns a complete list of URL paths and the full URL path
 * they would be redirected to.
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

/**
 * Remove any leading & trailing slashes
 */
function _removeSlashes(path) {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}
