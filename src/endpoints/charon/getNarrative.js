const fetch = require('node-fetch');
const {BadRequest, NotFound} = require("http-errors");

const authz = require("../../authz");
const utils = require("../../utils");
const {splitPrefixIntoParts} = require("../../utils/prefix");

const getNarrative = async (req, res) => {
  const query = req.query;
  const prefix = query.prefix;
  const validTypes = new Set(["markdown", "md"]);

  if (!prefix) throw new BadRequest("Required query parameter 'prefix' is missing");

  if (!validTypes.has((query.type || "").toLowerCase())) {
    throw new BadRequest(`Required query parameter 'type' has an unsupported value ('${query.type}').  Supported values are: ${Array.from(validTypes).join(', ')}`);
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
  authz.assertAuthorized(req.user, authz.actions.Read, source);

  // Remove 'en' from nCoV narrative prefixParts
  if (prefixParts[0] === 'ncov') {
    const index = prefixParts.indexOf('en');
    if (index >= 0) {
      prefixParts.splice(index, 1);
    }
  }

  // Generate the narrative's origin URL for fetching.
  const narrative = source.narrative(prefixParts);

  authz.assertAuthorized(req.user, authz.actions.Read, narrative);

  const fetchURL = await narrative.subresource("md").url();

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
