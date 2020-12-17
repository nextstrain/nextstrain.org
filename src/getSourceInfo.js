const queryString = require("query-string");
const assert = require('assert').strict;

const helpers = require("./getDatasetHelpers");
const {ResourceNotFoundError} = require("./exceptions");

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

  let sourceInfo;
  try {
    const {source} = helpers.splitPrefixIntoParts(query.prefix);

    // Authorization
    if (!source.visibleToUser(req.user)) {
      return helpers.unauthorized(req, res);
    }

    sourceInfo = await source.getInfo();
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).send("The requested URL does not exist");
    }

    return helpers.handle500Error(res, 'Error processing source info', err.message);
  }
  return res.json(sourceInfo);
};


module.exports = {
  getSourceInfo,
  default: getSourceInfo
};
