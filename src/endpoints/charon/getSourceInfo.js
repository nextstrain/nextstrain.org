const {BadRequest} = require("http-errors");

const authz = require("../../authz");
const {splitPrefixIntoParts} = require("../../utils/prefix");

/**
 * Prototype implementation.
 */
const getSourceInfo = async (req, res) => {
  const query = req.query;

  if (!query.prefix) throw new BadRequest("Required query parameter 'prefix' is missing");

  const {source} = splitPrefixIntoParts(query.prefix);

  // Authorization
  authz.assertAuthorized(req.user, authz.actions.Read, source);

  return res.json(await source.getInfo());
};


module.exports = {
  getSourceInfo,
  default: getSourceInfo
};
