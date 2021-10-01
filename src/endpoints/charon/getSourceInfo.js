const queryString = require("query-string");
const {BadRequest} = require("http-errors");

const {splitPrefixIntoParts} = require("../../utils/prefix");
const utils = require("../../utils");

/**
 * Prototype implementation.
 */
async function fromQuery(req, res) {
  const query = queryString.parse(req.url.split('?')[1]);

  if (!query.prefix) throw new BadRequest("Required query parameter 'prefix' is missing");

  return await _getInfo(req, res, query.prefix);
}


async function fromPath(req, res) {
  return await _getInfo(req, res, req.path);
}


async function _getInfo(req, res, prefix) {
  const {source} = splitPrefixIntoParts(prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return utils.unauthorized(req);
  }

  return res.json(await source.getInfo());
}


module.exports = {
  fromQuery,
  fromPath,
  default: fromQuery
};
