import { BadRequest } from './httpErrors.js';


/* CORS policy to allow read-only requests for public resources.
 *
 * Only set CORS response headers for GET and HEAD requests.  Do not support
 * CORS preflight requests.  This prevents CORS requests for other methods and
 * GET/HEAD requests which trigger the preflight requirement.
 *
 * Resources for further understanding:
 *
 *   • CORS protocol reference <https://fetch.spec.whatwg.org/#cors-protocol>
 *   • MDN's guide to CORS <https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS>
 */
const allowedCorsMethods = new Set(["GET", "HEAD"]);

const allowPublicReadOnlyCors = (req, res, next) => {
  if (allowedCorsMethods.has(req.method)) {
    /* All origins are ok for GET and HEAD requests.
     *
     * We primarily use the wildcard here—instead of reflecting the Origin
     * request header—to avoid Vary-ing the response on Origin.  However, it also
     * further prevents credentialed requests since they do not allow wildcard
     * usage.¹
     *
     * ¹ https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#credentialed_requests_and_wildcards
     */
    res.set("Access-Control-Allow-Origin", "*");

    /* All our response headers are ok to expose.
     *
     * This means requestors can use headers like Etag and Link.
     */
    res.set("Access-Control-Expose-Headers", "*");

    /* Explicit forbid credentialed requests by making sure the header allowing
     * them is omitted.
     *
     * This doesn't prevent simple credentialed requests from being made and us
     * responding, but it does cause the browser to throw away the response and
     * deny the requesting code access to it.
     */
    res.removeHeader("Access-Control-Allow-Credentials");
  }
  return next();
};


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


export {
  allowPublicReadOnlyCors,
  rejectParentTraversals,
};
