const authz = require("../../authz");
const utils = require("../../utils");
const queryString = require("query-string");
const {splitPrefixIntoParts, joinPartsIntoPrefix} = require("../../utils/prefix");
const metaSources = require("../../metaSources");

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
  authz.assertAuthorized(req.user, authz.actions.Read, source);

  const datasets = await source.availableDatasets() || [];
  const narratives = await source.availableNarratives() || [];

  if (!datasets.length) {
    utils.verbose(`No datasets available for ${source.name}`);
  }
  if (!narratives.length) {
    utils.verbose(`No narratives available for ${source.name}`);
  }

  return res.json({
    datasets: await Promise.all(datasets.map(async (path) => ({
      request: await joinPartsIntoPrefix({source, prefixParts: [path]}),
      secondTreeOptions: source.secondTreeOptions(path),
      buildUrl: source.name === "community"
        ? `https://github.com/${source.repo}`
        : null
    }))),
    narratives: await Promise.all(narratives.map(async (path) => ({
      request: await joinPartsIntoPrefix({source, prefixParts: [path], isNarrative: true})
    })))
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
