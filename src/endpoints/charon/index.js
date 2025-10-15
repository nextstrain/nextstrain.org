import { BadRequest, isHttpError } from '../../httpErrors.js';
import { splitPrefixIntoParts } from '../../utils/prefix.js';
import { setSource, setDataset, canonicalizeDataset, setNarrative } from '../sources.js';
import './setAvailableDatasets.js'; // sets globals
export { getAvailable } from './getAvailable.js';
export { getDataset } from './getDataset.js';
export { getNarrative } from './getNarrative.js';
export { getSourceInfo } from './getSourceInfo.js';

const setSourceFromPrefix = setSource(req => {
  const prefix = req.query.prefix;
  if (!prefix) throw new BadRequest("Required query parameter 'prefix' is missing");

  try {
    req.context.splitPrefixIntoParts = splitPrefixIntoParts(prefix);
  } catch (err) {
    if (!isHttpError(err)) {
      throw new BadRequest(`Couldn't parse the prefix '${prefix}': ${err}`);
    }
    throw err;
  }

  return req.context.splitPrefixIntoParts.source;
});

const setDatasetFromPrefix = setDataset(req => req.context.splitPrefixIntoParts.prefixParts.join("/"));

/**
 * Leave the URL path (e.g. /charon/getDataset) unchanged with only the
 * "prefix" query param updated with the resolved dataset path.
 */
const canonicalizeDatasetPrefix = canonicalizeDataset((req, path) => ({
  query: {
    ...req.query,
    prefix: path,
  }
}));

const setNarrativeFromPrefix = setNarrative(req => {
  const {prefixParts} = req.context.splitPrefixIntoParts;

  // Remove 'en' from nCoV narrative prefixParts
  if (prefixParts[0] === 'ncov') {
    const index = prefixParts.indexOf('en');
    if (index >= 0) {
      prefixParts.splice(index, 1);
    }
  }

  return prefixParts.join("/");
});

export {
  setSourceFromPrefix,
  setDatasetFromPrefix,
  canonicalizeDatasetPrefix,
  setNarrativeFromPrefix,
};
