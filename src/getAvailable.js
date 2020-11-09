const utils = require("./utils");
const {splitPrefixIntoParts, joinPartsIntoPrefix, unauthorized} = require("./getDatasetHelpers");
const {ResourceNotFoundError} = require("./exceptions");

/* handler for /charon/v2/dataset/ and /charon/getAvailable requests */
const getAvailable = async (req, res) => {
  const {source} = splitPrefixIntoParts(req.prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return unauthorized(req, res);
  }

  let datasets;
  let narratives;

  try {
    datasets = await source.availableDatasets() || [];
    narratives = await source.availableNarratives() || [];
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).send("The requested URL does not exist.");
    }
  }

  if (!datasets || !datasets.length) {
    utils.verbose(`No datasets available for ${source.name}`);
  }
  if (!narratives || !narratives.length) {
    utils.verbose(`No narratives available for ${source.name}`);
  }

  return res.json({
    datasets: datasets.map((path) => ({
      request: joinPartsIntoPrefix({source, prefixParts: [path]}),
      secondTreeOptions: source.secondTreeOptions(path),
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
