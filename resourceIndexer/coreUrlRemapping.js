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
 * A map of specific S3 object versions (via key & version ID tuple) to the
 * current URL the dataset is available at. These are intended to be used in the
 * case where the redirect of the original URL goes to a semantically different
 * dataset (as opposed to the URL redirecting to the same dataset at a
 * different location, which is the norm)
 */
const keyVersionsToUrls = new Map([
  ['ebola', new Map([
    ['urlPath', 'ebola/ebov-2013'],
    ['versions', new Set([
      /* note: versioned objects incl. root-sequence sidecar, v1 (meta/tree) JSONs */
      'JbR6aHm.sD0SCXpaIcG14e.Wn.bfxErD',
      'Y_5o_1ij5yMhX23opio_GIC8KiHYytcI',
      'DQvz5C6Z8Ykti9E521FlAlgaBkeyOGq0',
      'CzboV3n8_YOPuBTyA1.3qCkXgDIqZpdZ',
      '2MYdv9mEBUGYefZEUquE9lyuxxHfjxQ9',
      'A0JKybbTqwgERxLETcwYen_zg.jxgcb0',
      'L720m0OhpxYDCLGeiElDG1jIg_8jJA8S',
      'VAsOxpi9hbPweCtw4iGkiBwjYNqIU8Al',
    ])],
  ])],
]);

/**
 * Takes an old or incomplete nextstrain.org URL path and information about the
 * S3 object and returns the current nextstrain.org URL path for that resource
 * (dataset). This is how we can match resources which were surfaced under one
 * URL but now use a new one. If the provided URL would not be redirected we
 * return the provided path unchanged. Some examples:
 *
 *  OLD URL PATH              NEW URL PATH              COMMENT
 *  ebola                     ebola/ebov-2013           Only if S3 object's version ID in keyVersionsToUrls map
 *                                                      (i.e. only the pre-2025 West-African analyses files)
 *  ebola                     ebola/all-outbreaks       redirected via manifest JSON
 *  measles                   measles/genome            redirected via manifest JSON
 *  flu/seasonal/h3n2/ha/3y   seasonal-flu/h3n2/ha/3y   hardcoded server redirect logic
 *  seasonal-flu/h3n2/ha/3y   seasonal-flu/h3n2/ha/3y   valid (no change)
 *
 * @param {string} urlPath putative nextstrain.org URL path
 * @param {object} item information about the S3 object
 * @returns {string} nextstrain.org URL path
 */
export const remapCoreUrl = (urlPath, item) => {

  if (keyVersionsToUrls.has(urlPath) && keyVersionsToUrls.get(urlPath).get('versions').has(item.versionId)) {
    return keyVersionsToUrls.get(urlPath).get('urlPath');
  }

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
