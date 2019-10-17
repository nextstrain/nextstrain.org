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

  // XXX TODO: This is bad and should go away by refactoring second tree
  // enumeration into our source classes, potentially as part of the
  // availableDatasets() method.
  //   -trs, 3 Oct 2019
  const secondTreeOptions = (dataset) =>
    (global.availableDatasets.secondTreeOptions[source.name] || {})[dataset] || [];

  return res.json({
    datasets: datasets.map((path) => ({
      request: joinPartsIntoPrefix({source, prefixParts: [path]}),
      secondTreeOptions: secondTreeOptions(path),
      buildUrl: source.name === "community"
        ? `https://github.com/${source.repo}`
        : null
    })),
    narratives: narratives.map((path) => ({
      request: joinPartsIntoPrefix({source, prefixParts: [path], isNarrative: true})
    }))
  });
};

module.exports = {
  default: getAvailable
};
