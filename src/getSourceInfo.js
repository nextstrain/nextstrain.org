const queryString = require("query-string");
const assert = require('assert').strict;

const helpers = require("./getDatasetHelpers");

/**
 * Prototype implementation.
 */
const getSourceInfo = async (req, res) => {
  const query = queryString.parse(req.url.split('?')[1]);
  try {
    assert(query.prefix);
  } catch {
    return res.status(400).send("No prefix defined");
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
    return helpers.handle500Error(res, 'Error processing source info', err.message);
  }
  return res.json(sourceInfo);
};


module.exports = {
  getSourceInfo,
  default: getSourceInfo
};
