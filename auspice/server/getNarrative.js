const fetch = require('node-fetch');
const queryString = require("query-string");
const utils = require("./utils");
const helpers = require("./getDatasetHelpers");
const parseNarrative = require('./parseNarrative').default;

const getNarrative = async (req, res) => {
  let prefix;
  try {
    prefix = queryString.parse(req.url.split("?")[1]).prefix;
  } catch (err) {
    return helpers.handleError(res, "No prefix in narrative URL query");
  }

  const source = helpers.decideSourceFromPrefix(prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    const user = req.user
      ? `user ${req.user.username}`
      : `an anonymous user`;

    utils.warn(`Denying getNarrative access to ${user} for ${prefix}`);
    return res.status(404).end();
  }

  // Slice off the source name, if applicable, and "narratives/", and generate
  // the narrative's origin URL for fetching.
  const prefixParts = helpers.splitPrefixIntoParts(prefix);
  const pathParts = source.name === "live"
    ? prefixParts.slice(1)
    : prefixParts.slice(2);

  const narrative = source.narrative(pathParts);
  const fetchURL = narrative.url();

  utils.log(`trying to fetch & parse narrative file: ${fetchURL}`);
  try {
    const response = await fetch(fetchURL);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${fetchURL}: ${response.status} ${response.statusText}`);
    }

    const fileContents = await response.text();
    const blocks = parseNarrative(fileContents);
    res.send(JSON.stringify(blocks).replace(/</g, '\\u003c'));
    utils.verbose("SUCCESS");
  } catch (err) {
    return helpers.handleError(res, `Narratives couldn't be served -- ${err.message}`);
  }
};

module.exports = {
  default: getNarrative
};
