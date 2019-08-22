const fetch = require('node-fetch');
const utils = require("./utils");

/* Build the available datasets by querying the manifest JSONs
 * Note that this will require restarting the server to update!
 * This should be put in somewhere so that an API request can update things
 * and also so that different handlers can access it!
 *
 * Currently these are set as globals, so that other handlers can access them.
 * This mimics the behavior of the auspice server around version 1.32.
 * Ideally we can find a solution which doesn't use globals.
 */
global.availableDatasets = {defaults: {}};


const convertManifestJsonToAvailableDatasetList = (old, pathPrefix=false) => {
  const allParts = [];
  const defaults = {}; /* holds the defaults, used to complete incomplete paths */
  const recurse = (partsSoFar, obj) => {
    if (typeof obj === "string") {
      // done
      allParts.push(partsSoFar);
    }
    let keys = Object.keys(obj);

    /* if there's only one key in the object it's the "name" of the level
    in the heirachy, e.g. "category" or "lineage", which we skip over.
    Note that for levels with only 1 option there's 2 keys (one is "default") */
    if (keys.length === 1) {
      obj = obj[keys[0]]; // eslint-disable-line
      keys = Object.keys(obj); // skip level
    }

    const defaultValue = obj.default;
    if (!defaultValue) {
      return;
    }
    defaults[partsSoFar.join("/")] = defaultValue;

    const orderedKeys = [];
    keys.forEach((k) => {
      if (k !== "default") {
        orderedKeys.push(k);
      }
    });
    orderedKeys.forEach((key) => {
      const newParts = partsSoFar.slice();
      newParts.push(key);
      recurse(newParts, obj[key]);
    });
  };

  recurse(pathPrefix ? [pathPrefix] : [], old.pathogen);
  return [
    allParts.map((fileParts) => ({request: fileParts.join("/")})),
    defaults
  ];
};

/* setAvailableDatasetsFromManifest
 * Collect available datasets by fetching the manifest JSON
 * and parsing it.
 * In the future this may be done by crawling the S3 bucket
 *
 * SIDE EFFECT: sets global.availableDatasets
 */
const setAvailableDatasetsFromManifest = async () => {
  utils.verbose("Fetching manifests for live & staging");

  const servers = {
    live: "data",
    staging: "staging"
  };

  const promises = Object.keys(servers).map((server) => {
    return fetch(`http://${servers[server]}.nextstrain.org/manifest_guest.json`)
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        let defaultsForPathCompletion;

        if (server === 'staging') {
          [data, defaultsForPathCompletion] = convertManifestJsonToAvailableDatasetList(data, server);
        } else {
          [data, defaultsForPathCompletion] = convertManifestJsonToAvailableDatasetList(data);
        }
        utils.verbose(`Successfully got manifest for "${server}"`);

        global.availableDatasets[server] = data;
        global.availableDatasets.defaults[server] = defaultsForPathCompletion;
      })
      .catch((e) => {
        console.error(e);
        utils.warn(`Failed to getch manifest for "${server}"`);
      });
  });

  Promise.all(promises)
    .then((results) => {
      utils.log(`Got manifests for ${Object.keys(global.availableDatasets).join(", ")}`);
    })
    .catch((e) => {
      console.error(e);
    });


};

setAvailableDatasetsFromManifest();
