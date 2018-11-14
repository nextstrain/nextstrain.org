const utils = require("../utils");
const queryString = require("query-string");

/* Note that global.availableDatasets & global.availableNarratives exist */

/* handler for /charon/getAvailable requests */
const getAvailable = (req, res) => {
  /* nextstrain.org only considers two sources: "live" and "staging" */
  const prefix = queryString.parse(req.url.split('?')[1]).prefix || "";
  const source = prefix.includes("staging") ? "staging" : "live";
  utils.verbose(`getAvailable prefix: "${prefix}"`);

  let datasets = [];
  if (global.availableDatasets[source]) {
    datasets = global.availableDatasets[source];
  } else {
    utils.verbose(`No datasets available for ${source}`);
  }

  let narratives = [];
  if (global.availableNarratives[source]) {
    narratives = global.availableNarratives[source];
  } else {
    utils.verbose(`No narratives available for ${source}`);
  }

  res.json({datasets, narratives});
};

module.exports = {
  default: getAvailable
};
