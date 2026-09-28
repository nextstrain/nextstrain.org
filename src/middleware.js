import rateLimit from 'express-rate-limit';

import { BadRequest } from './httpErrors.js';
import {
  BLOCKED_IPS,
  BLOCKED_REQUEST_PATTERNS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from './config.js';


/**
 * Reject a request with a status + short plain-text body, closing the connection.
 *
 * The `Connection: close` header matters for abusive POSTs: when we respond
 * without reading the request body, a keep-alive connection would make Node
 * drain the entire (attacker-controlled) inbound body before the socket frees —
 * observed holding blocked POSTs open for seconds.  `Connection: close` makes
 * Node send the complete response and then a graceful FIN instead, releasing the
 * socket promptly without the truncated-response resets (Heroku H13/H18) a hard
 * `socket.destroy()` would cause.
 *
 * @param {express.response} res
 * @param {number} status
 * @param {string} message
 */
const rejectAndClose = (res, status, message) => {
  res.set("Connection", "close");
  return res.status(status).type("text/plain").end(message);
};


/**
 * The true source IP of a request as observed by Heroku's router.
 *
 * With `trust proxy` enabled, Express's `req.ip` is the *left*-most
 * X-Forwarded-For entry, which is supplied by — and therefore forgeable by —
 * the client.  Heroku's router *appends* the connecting socket peer's address
 * as the *right*-most entry, and a client cannot forge anything to the right of
 * it, so that entry is the trustworthy "who actually connected to us" value.
 *
 * Falls back to the socket address for non-proxied (e.g. local dev) requests.
 *
 * @param {express.request} req
 * @returns {string|undefined}
 */
const connectingIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) {
    const hops = xff.split(",").map(s => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return req.socket?.remoteAddress;
};


/**
 * Rejects requests from source IPs listed in {@link module:config.BLOCKED_IPS}.
 *
 * A no-op unless BLOCKED_IPS is configured.  Intended to be registered as early
 * as possible in the middleware stack so blocked traffic does the least
 * possible work.  See the BLOCKED_IPS docs for its (deliberate) limitations.
 *
 * @function blockIps
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 */
const blockIps = (req, res, next) => {
  if (BLOCKED_IPS.size && BLOCKED_IPS.has(connectingIp(req))) {
    return rejectAndClose(res, 403, "Forbidden\n");
  }
  return next();
};


/**
 * Does a request match one of the committed abusive {@link module:config.BLOCKED_REQUEST_PATTERNS}?
 *
 * Pure and exported for unit testing.  Matches on method + pathname only.
 *
 * @param {string} method - HTTP method, e.g. "GET"
 * @param {string} path - req.path (pathname, leading slash, no query string)
 * @returns {boolean}
 */
const matchesBlockedRequest = (method, path) =>
  BLOCKED_REQUEST_PATTERNS.some(pattern => pattern.method === method && pattern.path.test(path));


/**
 * Rejects requests whose method+path match a known-abusive signature, regardless
 * of source IP.  This catches the flood campaign even as it rotates IPs.
 *
 * Registered early (alongside {@link blockIps}) so blocked traffic does the least
 * possible work.  Like blockIps, this is app-level: it stops abuse reaching
 * application logic but does not reduce Heroku router/dyno load.
 *
 * @function blockRequests
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 */
const blockRequests = (req, res, next) =>
  matchesBlockedRequest(req.method, req.path)
    ? rejectAndClose(res, 403, "Forbidden\n")
    : next();


/**
 * Is this a static-asset path that the rate limiter should not count?
 *
 * A single Next.js page load fetches many `/_next/…` assets (and Auspice fetches
 * `/dist/…`); counting those would throttle legitimate users.  The flood targets
 * dynamic paths, so exempting static assets is safe.  Exported for testing.
 *
 * @param {string} path - req.path
 * @returns {boolean}
 */
const isStaticAssetPath = (path) =>
  path.startsWith("/_next/") || path.startsWith("/dist/") || path === "/favicon.ico";


/**
 * Build the per-IP rate-limiting middleware.
 *
 * Called once at app setup (never per-request).  Keyed on the spoof-resistant
 * {@link connectingIp} rather than express-rate-limit's default `req.ip` (which,
 * with `trust proxy` enabled, is the forgeable left-most X-Forwarded-For entry).
 * Because we supply our own keyGenerator, express-rate-limit's trust-proxy
 * validations do not apply; we disable them explicitly for clarity.  Uses the
 * default in-memory (per-dyno) store.  Over-limit requests get the same
 * connection-closing rejection as blocked ones, as a 429.
 *
 * @returns {Function} express middleware
 */
const makeRateLimiter = () => rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => connectingIp(req) ?? "unknown",
  skip: (req) => isStaticAssetPath(req.path),
  validate: { trustProxy: false, xForwardedForHeader: false },
  handler: (req, res) => rejectAndClose(res, 429, "Too many requests\n"),
});


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
  connectingIp,
  blockIps,
  matchesBlockedRequest,
  blockRequests,
  isStaticAssetPath,
  makeRateLimiter,
  allowPublicReadOnlyCors,
  rejectParentTraversals,
};
