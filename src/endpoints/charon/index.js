const {BadRequest, isHttpError} = require("http-errors");

const {splitPrefixIntoParts} = require("../../utils/prefix");
const {setSource, setDataset, canonicalizeDataset, setNarrative} = require("../sources");

require("./setAvailableDatasets"); // sets globals
const getAvailable = require("./getAvailable").default;
const getDataset = require("./getDataset").default;
const getNarrative = require("./getNarrative").default;
const getSourceInfo = require("./getSourceInfo").default;

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

const canonicalizeDatasetPrefix = canonicalizeDataset((req, resolvedPrefix) => {
  // A absolute base is required but we won't use it, so use something bogus.
  const resolvedUrl = new URL(req.originalUrl, "http://x");
  resolvedUrl.searchParams.set("prefix", resolvedPrefix);

  return resolvedUrl.pathname + resolvedUrl.search;
});

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

module.exports = {
  setSourceFromPrefix,
  setDatasetFromPrefix,
  canonicalizeDatasetPrefix,
  setNarrativeFromPrefix,

  getAvailable,
  getDataset,
  getNarrative,
  getSourceInfo
};
