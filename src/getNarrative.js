const fetch = require('node-fetch');
const assert = require('assert').strict;
const {NotFound} = require("http-errors");

const utils = require("./utils");
const {unauthorized, splitPrefixIntoParts} = require("./getDatasetHelpers");

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
    return res.status(400).send("The nextstrain.org server only serves getNarrative requests in markdown format. Please specify `?type=md`");
  }

  /*
   * "inrb-drc" was the first of the Nextstrain groups. Groups now live at
   * `nextstrain.org/groups`, but we want to support old URLs for INRB DRC by
   * redirecting requests from "/inrb-drc" to "/groups/inrb-drc".
   */
  if (prefix.startsWith('/inrb-drc')) {
    return res.redirect("getNarrative?type=md&prefix=/groups" + prefix);
  }

  const {source, prefixParts} = splitPrefixIntoParts(prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return unauthorized(req, res);
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
  const fetchURL = await narrative.url();

  try {
    utils.log(`Fetching narrative ${fetchURL} and streaming to client for parsing`);
    const response = await fetch(fetchURL);
    if (response.status !== 200) throw new Error();
    const narrativeContents = await response.text();
    return res.set("Content-Type", "text/markdown").send(narrativeContents);
  } catch (err) {
    throw new NotFound(`Failed to fetch ${fetchURL}`);
  }
};

module.exports = {
  default: getNarrative
};
