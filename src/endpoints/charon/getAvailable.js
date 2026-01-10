import * as authz from '../../authz/index.js';
import { CommunitySource } from '../../sources/index.js';
import * as utils from '../../utils/index.js';
import { splitPrefixIntoParts, joinPartsIntoPrefix } from '../../utils/prefix.js';
import * as metaSources from '../../metaSources.js';

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
    datasets: await Promise.all(datasets.map(async (dataset) => {
      const path = typeof dataset === 'string' ? dataset : dataset.pathname;
      const lastUpdated = typeof dataset === 'object' ? dataset.lastUpdated : undefined;
      return {
        request: await joinPartsIntoPrefix({source, prefixParts: [path]}),
        secondTreeOptions: source.secondTreeOptions(path),
        buildUrl: source instanceof CommunitySource
          ? `https://github.com/${source.repo}`
          : null,
        lastUpdated: lastUpdated ? lastUpdated.toISOString().split('T')[0] : undefined,
      };
    })),
    narratives: await Promise.all(narratives.map(async (narrative) => {
      const path = typeof narrative === 'string' ? narrative : narrative.pathname;
      const lastUpdated = typeof narrative === 'object' ? narrative.lastUpdated : undefined;
      return {
        request: await joinPartsIntoPrefix({source, prefixParts: [path], isNarrative: true}),
        lastUpdated: lastUpdated ? lastUpdated.toISOString().split('T')[0] : undefined,
      };
    }))
  });
};

async function collectAllAvailableGroups(user) {
  const source = new metaSources.Groups(user);
  const datasets = await source.availableDatasets();
  const narratives = await source.availableNarratives();
  return {
    datasets: datasets.map((item) => {
      const request = typeof item === 'string' ? item : item.pathname;
      const lastUpdated = typeof item === 'object' ? item.lastUpdated : undefined;
      return {
        request,
        lastUpdated: lastUpdated ? lastUpdated.toISOString().split('T')[0] : undefined,
      };
    }),
    narratives: narratives.map((item) => {
      const request = typeof item === 'string' ? item : item.pathname;
      const lastUpdated = typeof item === 'object' ? item.lastUpdated : undefined;
      return {
        request,
        lastUpdated: lastUpdated ? lastUpdated.toISOString().split('T')[0] : undefined,
      };
    })
  };
}

export {
  getAvailable,
};
