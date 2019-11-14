const fetch = require('node-fetch');
const queryString = require("query-string");
const utils = require("./utils");
const helpers = require("./getDatasetHelpers");
const auspice = require("auspice");

const getNarrative = async (req, res) => {
  let prefix;
  try {
    prefix = queryString.parse(req.url.split("?")[1]).prefix;
  } catch (err) {
    return helpers.handleError(res, "No prefix in narrative URL query");
  }

  const {source, prefixParts} = helpers.splitPrefixIntoParts(prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return helpers.unauthorized(req, res);
  }

  // Generate the narrative's origin URL for fetching.
  const narrative = source.narrative(prefixParts);
  const fetchURL = narrative.url();

  utils.log(`trying to fetch & parse narrative file: ${fetchURL}`);
  try {
    const response = await fetch(fetchURL);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${fetchURL}: ${response.status} ${response.statusText}`);
    }

    const fileContents = await response.text();
    const blocks = auspice.parseNarrativeFile(fileContents);
    const blocksForClient = JSON.stringify(blocks).replace(/</g, '\\u003c');
    utils.verbose("SUCCESS");
    return res.send(blocksForClient);
  } catch (err) {
    return helpers.handleError(res, `Narratives couldn't be served -- ${err.message}`);
  }
};

module.exports = {
  default: getNarrative
};
