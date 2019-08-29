const utils = require("./utils");
const queryString = require("query-string");
const {decideSourceFromPrefix} = require("./getDatasetHelpers");

/* Note that global.availableDatasets & global.availableNarratives exist */

/* handler for /charon/getAvailable requests */
const getAvailable = async (req, res) => {
  const prefix = queryString.parse(req.url.split('?')[1]).prefix || "";
  utils.verbose(`getAvailable prefix: "${prefix}"`);

  const source = decideSourceFromPrefix(prefix);

  const datasets = await source.availableDatasets() || [];
  const narratives = await source.availableNarratives() || [];

  if (!datasets || !datasets.length) {
    utils.verbose(`No datasets available for ${source.name}`);
  }
  if (!narratives || !narratives.length) {
    utils.verbose(`No narratives available for ${source.name}`);
  }

  res.json({datasets, narratives});
};

module.exports = {
  default: getAvailable
};
