const fetch = require('node-fetch');
const assert = require('assert').strict;

const utils = require("./utils");
const helpers = require("./getDatasetHelpers");

const getNarrative = async (req, res) => {
  const query = req.query;
  const prefix = query.prefix;

  try {
    assert(prefix);
  } catch {
    return res.status(400).send("No prefix in getNarrative URL query");
  }

  try {
    assert(query.type);
    assert(["markdown", "md"].includes(query.type.toLowerCase()));
  } catch {
    return res.status(400).send("The nextstrain.org server only serves " +
      "getNarrative requests in markdown format. Please specify a `.md` or `.markdown` file " +
      "ending for charon/v2/narrative requests (or `?type=md` if using the unversioned charon API)");
  }

  /*
   * "inrb-drc" was the first of the Nextstrain groups. Groups now live at
   * `nextstrain.org/groups`, but we want to support old URLs for INRB DRC by
   * redirecting requests from "/inrb-drc" to "/groups/inrb-drc".
   */
  if (prefix.startsWith('/inrb-drc')) {
    return res.redirect("getNarrative?type=md&prefix=/groups" + prefix);
  }

  const {source, prefixParts} = helpers.splitPrefixIntoParts(prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return helpers.unauthorized(req, res);
  }

  // Remove 'en' from nCoV narrative prefixParts
  if (prefixParts[0] === 'ncov') {
    const index = prefixParts.indexOf('en');
    if (index >= 0) {
      prefixParts.splice(index, 1);
    }
  }

  // Generate the narrative's origin URL for fetching.
  const narrative = source.narrative(prefixParts);
  const fetchURL = narrative.url();

  try {
    utils.log(`Fetching narrative ${fetchURL} and streaming to client for parsing`);
    const response = await fetch(fetchURL);
    if (response.status === 404) {
      return res.status(404).send("The requested URL does not exist.");
    } else if (!(response.status === 200 || response.status === 304)) {
      throw new Error(`Failed to fetch ${fetchURL}: ${response.status} ${response.statusText}`);
    }
    res.set("Content-Type", "text/markdown");
    return response.body.pipe(res);
  } catch (err) {
    return helpers.handle500Error(res, `Narratives couldn't be served -- ${err.message}`);
  }
};

module.exports = {
  default: getNarrative
};
