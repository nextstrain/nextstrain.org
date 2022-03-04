const {BadRequest} = require("http-errors");


/**
 * Rejects any attempted path traversals (..) which may be present if the
 * client sending the request didn't normalize the URL path when making the
 * HTTP request (e.g. curl's --path-as-is option).  This is almost always
 * intentional and malicious.
 *
 * Percent-encoded forms are rejected too, as "." is not a reserved character
 * and percent-encoding is only an _escaping_ mechanism for reserved
 * characters, e.g. the following are equivalent:
 *
 *    new URL("https://example.com/foo/../bar")     → https://example.com/bar
 *    new URL("https://example.com/foo/%2e%2e/bar") → https://example.com/bar
 *
 * A blanket ban on traversals means our route handlers have to worry much less
 * about combining system paths with request paths.
 *
 * @function rejectParentTraversals
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 * @throws {BadRequest}
 */
const PARENT_TRAVERSALS = new Set(["..", "%2e.", ".%2e", "%2e%2e"]);

const isParentTraversal = pathPart =>
  PARENT_TRAVERSALS.has(pathPart.toLowerCase());

const rejectParentTraversals = (req, res, next) => {
  if (req.path.split("/").some(isParentTraversal)) {
    throw new BadRequest("parent traversal in path");
  }
  return next();
};


module.exports = {
  rejectParentTraversals,
};
