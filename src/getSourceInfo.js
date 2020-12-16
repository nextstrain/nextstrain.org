const queryString = require("query-string");
const helpers = require("./getDatasetHelpers");

/**
 * Prototype implementation.
 */
const getSourceInfo = async (req, res) => {
  const query = queryString.parse(req.url.split('?')[1]);
  if (!query.prefix) {
    throw new Error("No prefix defined");
  }
  const {source} = helpers.splitPrefixIntoParts(query.prefix);

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return helpers.unauthorized(req, res);
  }

  let sourceInfo;
  try {
    sourceInfo = await source.getInfo();
  } catch (err) {
    return helpers.handleError(res, `No source info available`, err.message);
  }
  return res.json(sourceInfo);
};


module.exports = {
  getSourceInfo,
  default: getSourceInfo
};
