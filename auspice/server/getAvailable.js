const utils = require("./utils");
const queryString = require("query-string");
const {splitPrefixIntoParts, joinPartsIntoPrefix, unauthorized} = require("./getDatasetHelpers");

/* handler for /charon/getAvailable requests */
const getAvailable = async (req, res) => {
  const prefix = queryString.parse(req.url.split('?')[1]).prefix || "";
  utils.verbose(`getAvailable prefix: "${prefix}"`);

  const {source} = splitPrefixIntoParts(prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return unauthorized(req, res);
  }

  const datasets = await source.availableDatasets() || [];
  const narratives = await source.availableNarratives() || [];

  if (!datasets || !datasets.length) {
    utils.verbose(`No datasets available for ${source.name}`);
  }
  if (!narratives || !narratives.length) {
    utils.verbose(`No narratives available for ${source.name}`);
  }

  res.json({
    datasets: datasets.map(path => ({
      request: joinPartsIntoPrefix({source, prefixParts: [path]})
    })),
    narratives: narratives.map(path => ({
      request: joinPartsIntoPrefix({source, prefixParts: ["narratives", path]})
    })),
  });
};

module.exports = {
  default: getAvailable
};
