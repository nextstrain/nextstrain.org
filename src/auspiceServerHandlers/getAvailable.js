const utils = require("../utils");
const queryString = require("query-string");
const manifestHelpers = require("./manifests");
const fetch = require('node-fetch');

/* Build the manifests & available narratives.
 * Note that this will require restarting the server to update!
 * This should be put in somewhere so that an API request can update things
 * and also so that different handlers can access it!
 */
let availableDatasets = {};
manifestHelpers.buildManifests()
  .then((data) => {availableDatasets = data;});
const availableNarratives = {};
try {
  (() => new Promise((resolve, reject) => {
    const parseFiles = (files) => {
      const parsed = files
        .filter((file) => file.endsWith(".md") && file!=="README.md")
        .map((file) => file.replace(".md", ""))
        .map((file) => file.split("_"));
      parsed.forEach((partsOfPath) => {partsOfPath.splice(0, 0, "narratives");});
      return parsed;
    };

    fetch("https://api.github.com/repos/nextstrain/narratives/contents")
      .then((result) => result.json())
      .then((json) => {
        const data = parseFiles(json.map((b) => b.name));
        if (!data) {
          reject(`No available narratives`);
        }
        availableNarratives.live = data;
      })
      .catch(() => {
        utils.warn(`Error fetching (github narrative list`);
      });
  }))();
} catch (err) {
  utils.warn(err);
}

const getAvailableDatasets = (source) => availableDatasets[source];
global.BAD_GET_AVAILABLE_DATASETS = getAvailableDatasets;

/* handler for /charon/getAvailable requests */
const getAvailable = (req, res) => {
  const prefix = queryString.parse(req.url.split('?')[1]).prefix || "";
  /* nextstrain.org only considers two sources: "live" and "staging" */
  const source = prefix.includes("staging") ? "staging" : "live";
  utils.verbose(`getAvailable prefix: "${prefix}", source: "${source}"`);

  let datasets = [];
  if (availableDatasets[source]) {
    datasets = availableDatasets[source];
  } else {
    utils.verbose(`No datasets available for ${source}`);
  }

  let narratives = [];
  if (availableNarratives[source]) {
    narratives = availableNarratives[source];
  } else {
    utils.verbose(`No narratives available for ${source}`);
  }

  res.json({datasets, narratives, source});
};

module.exports = {
  default: getAvailable,
  getAvailableDatasets
};
