const queryString = require("query-string");
const {BadRequest} = require("http-errors");

const helpers = require("./getDatasetHelpers");
const utils = require("./utils");

/**
 * Prototype implementation.
 */
const getSourceInfo = async (req, res) => {
  const query = queryString.parse(req.url.split('?')[1]);

  if (!query.prefix) throw new BadRequest("Required query parameter 'prefix' is missing");

  const {source} = helpers.splitPrefixIntoParts(query.prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return utils.unauthorized(req);
  }

  return res.json(await source.getInfo());
};


module.exports = {
  getSourceInfo,
  default: getSourceInfo
};
