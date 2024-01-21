import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertManifestJsonToAvailableDatasetList } from './parseManifest.js';
import * as utils from '../../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __basedir = path.join(__dirname, "..", "..", "..");


/* Build the available datasets by querying the manifest JSONs
 * Note that this will require restarting the server to update!
 * This should be put in somewhere so that an API request can update things
 * and also so that different handlers can access it!
 *
 * Currently these are set as globals, so that other handlers can access them.
 * This mimics the behavior of the auspice server around version 1.32.
 * Ideally we can find a solution which doesn't use globals.
 */
global.availableDatasets = {
  secondTreeOptions: {},
  defaults: {}
};


/* setAvailableDatasetsFromManifest
 * Collect available datasets by fetching the manifest JSON
 * and parsing it.
 * In the future this may be done by crawling the S3 bucket
 * We use the "core" manifest for both core (nextstrain-data)
 * and staging (nextstrain-staging) sources.
 * SIDE EFFECT: modifies global.availableDatasets
 */
const setAvailableDatasetsFromManifest = () => {
  const manifestPath = path.join(__basedir, `./data/manifest_core.json`);
  try {
    const data = JSON.parse(fs.readFileSync(manifestPath));
    const {datasets, secondTreeOptions, defaults} = convertManifestJsonToAvailableDatasetList(data);
    global.availableDatasets.core = datasets;
    global.availableDatasets.secondTreeOptions.core = secondTreeOptions;
    global.availableDatasets.defaults.core = defaults;
    /* duplicate these (by reference) in places the staging source will use. We could modify the staging source
    itself but this is easier, and when we move past using a manifest file then presumably the core
    and staging sources will diverge again. */
    global.availableDatasets.staging = datasets;
    global.availableDatasets.secondTreeOptions.staging = secondTreeOptions;
    global.availableDatasets.defaults.staging = defaults;
    utils.verbose(`Successfully loaded ${manifestPath} which we'll use for both core & staging sources.`);
  } catch (e) {
    console.error(e);
    utils.warn(`Failed to parse ${manifestPath} - please check its contents (e.g. this could be a JSON formatting error).`);
  }
};

setAvailableDatasetsFromManifest();
