const cookie = require("cookie");
const {BadRequest} = require("http-errors");
const utils = require("./utils");


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


/**
 * Copies a request cookie from *oldName* to *newName*.
 *
 * Modifies the HTTP Cookie header in `req.headers` to make it appear as if the
 * same data was sent for both cookie names.
 *
 * The copy only happens if the old cookie is sent and the new cookie is not.
 */
const copyCookie = (oldName, newName) => (req, res, next) => {
  const rawCookies = cookie.parse(req.headers.cookie ?? "", {decode: String});

  const oldCookie = rawCookies[oldName];
  const newCookie = rawCookies[newName];

  if (oldCookie && !newCookie) {
    utils.verbose(`Copying cookie ${oldName} to ${newName}`);
    // Appending is safe because we know there is an existing cookie already
    req.headers.cookie += `; ${newName}=${oldCookie}`;
  }

  return next();
};


module.exports = {
  rejectParentTraversals,
  copyCookie,
};
