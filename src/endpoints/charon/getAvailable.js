import authz from '../../authz';
import { CommunitySource } from '../../sources';
import utils from '../../utils';
import { splitPrefixIntoParts, joinPartsIntoPrefix } from '../../utils/prefix';
import metaSources from '../../metaSources';

/* handler for /charon/getAvailable requests */
const getAvailable = async (req, res) => {
  const prefix = req.query.prefix ?? "/";
  utils.verbose(`getAvailable prefix: "${prefix}"`);

  // `prefix=/groups` is special-cased as it is not backed by a single Source
  if (prefix.replace(/\//g, '')==="groups") {
    return res.json(await collectAllAvailableGroups(req.user));
  }

  const {source} = splitPrefixIntoParts(prefix);

  // Authorization
  authz.assertAuthorized(req.user, authz.actions.Read, source);

  const datasets = (await source.availableDatasets()) || [];
  const narratives = (await source.availableNarratives()) || [];

  if (!datasets.length) {
    utils.verbose(`No datasets available for ${source}`);
  }
  if (!narratives.length) {
    utils.verbose(`No narratives available for ${source}`);
  }

  return res.json({
    datasets: await Promise.all(datasets.map(async (path) => ({
      request: await joinPartsIntoPrefix({source, prefixParts: [path]}),
      secondTreeOptions: source.secondTreeOptions(path),
      buildUrl: source instanceof CommunitySource
        ? `https://github.com/${source.repo}`
        : null
    }))),
    narratives: await Promise.all(narratives.map(async (path) => ({
      request: await joinPartsIntoPrefix({source, prefixParts: [path], isNarrative: true})
    })))
  });
};

async function collectAllAvailableGroups(user) {
  const source = new metaSources.Groups(user);
  const datasets = await source.availableDatasets();
  const narratives = await source.availableNarratives();
  return {
    datasets: datasets.map((request) => ({request})),
    narratives: narratives.map((request) => ({request}))
  };
}

export default {
  default: getAvailable
};
