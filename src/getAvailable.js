const utils = require("./utils");
const queryString = require("query-string");
const {splitPrefixIntoParts, joinPartsIntoPrefix, unauthorized} = require("./getDatasetHelpers");
const {ResourceNotFoundError} = require("./exceptions");
const metaSources = require("./metaSources");

/* handler for /charon/getAvailable requests */
const getAvailable = async (req, res) => {
  const prefix = queryString.parse(req.url.split('?')[1]).prefix || "";
  utils.verbose(`getAvailable prefix: "${prefix}"`);

  // `prefix=/groups` is special-cased as it is not backed by a single Source
  if (prefix.replace(/\//g, '')==="groups") {
    return res.json(await collectAllAvailableGroups(req.user));
  }

  const {source} = splitPrefixIntoParts(prefix);

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

async function collectAllAvailableGroups(user) {
  const source = new (metaSources.get("groups"))(user);
  const datasets = await source.availableDatasets();
  const narratives = await source.availableNarratives();
  return {
    datasets: datasets.map((request) => ({request})),
    narratives: narratives.map((request) => ({request}))
  };
}

module.exports = {
  default: getAvailable
};
