import rateLimit from 'express-rate-limit';

import { BadRequest, Forbidden, MethodNotAllowed, TooManyRequests } from './httpErrors.js';
import {
  BLOCKED_IPS,
  BLOCKED_REQUEST_PATTERNS,
  PRODUCTION,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from './config.js';


/**
 * The true source IP of a request as observed by Heroku's router.
 *
 * Heroku appends the connecting client's IP as the *right*-most X-Forwarded-For
 * entry; a client cannot forge anything to the right of it, so that entry is the
 * trustworthy "who actually connected to us" value.  (Express's `req.ip`, with
 * `trust proxy` enabled, is the *left*-most — client-supplied and forgeable —
 * entry, so we do not use it.)  Falls back to the socket address for non-proxied
 * (e.g. local dev) requests.
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
 * Is an IP address in a private, loopback, link-local, or reserved range?
 *
 * A request whose connecting IP resolves to one of these in production is
 * provably spoofed — no legitimate external client reaches the Heroku router
 * from a private/loopback address — so we treat it as abusive.  (In development
 * the connecting IP legitimately IS loopback, so callers gate this on
 * production.)
 *
 * @param {string|undefined} ip
 * @returns {boolean}
 */
const isPrivateOrReservedIp = (ip) => {
  if (!ip) return false;
  const addr = ip.toLowerCase().replace(/^::ffff:/, ""); // unwrap IPv4-mapped IPv6
  return (
    addr === "::1"
    || addr.startsWith("127.")
    || addr.startsWith("10.")
    || addr.startsWith("192.168.")
    || addr.startsWith("169.254.")
    || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(addr)
    || addr.startsWith("fe80:")        // IPv6 link-local
    || /^f[cd][0-9a-f]*:/.test(addr)   // IPv6 unique-local fc00::/7
  );
};


/**
 * Does a request match one of the committed abusive {@link module:config.BLOCKED_REQUEST_PATTERNS}?
 *
 * Pure and exported for unit testing.  A pattern with no `method` matches any
 * method (scanner signatures are never valid under any verb).
 *
 * @param {string} method - HTTP method, e.g. "GET"
 * @param {string} path - req.path (pathname, leading slash, no query string)
 * @returns {boolean}
 */
const matchesBlockedRequest = (method, path) =>
  BLOCKED_REQUEST_PATTERNS.some(p => (p.method === undefined || p.method === method) && p.path.test(path));


/**
 * Rejects abusive requests before any other work, by source IP or request shape.
 *
 * Registered first so blocked traffic is rejected as cheaply as possible (a
 * thrown 403 handled by the central error handler, well before the Next.js
 * catch-all).  Three checks:
 *   1. connecting IP in {@link module:config.BLOCKED_IPS};
 *   2. (production only) connecting IP in a private/reserved range — spoofed;
 *   3. request shape matches {@link module:config.BLOCKED_REQUEST_PATTERNS}.
 *
 * Like all app-level controls this does not shed Heroku router load, but making
 * flood rejection cheap raises the dyno throughput ceiling and helps keep the
 * router backlog below the H11 threshold.
 *
 * @function blockRequests
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 * @throws {Forbidden}
 */
const blockRequests = (req, res, next) => {
  const ip = connectingIp(req);
  if (
    (BLOCKED_IPS.size && BLOCKED_IPS.has(ip))
    || (PRODUCTION && isPrivateOrReservedIp(ip))
    || matchesBlockedRequest(req.method, req.path)
  ) {
    throw new Forbidden("Forbidden");
  }
  return next();
};


/**
 * Is this a static-asset path the rate limiter should not count?
 *
 * A single Next.js page load fetches many `/_next/…` assets (and Auspice fetches
 * `/dist/…`); counting those would throttle legitimate users.  Floods target
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
 * {@link connectingIp} rather than express-rate-limit's default `req.ip` (the
 * forgeable left-most X-Forwarded-For entry); because we supply our own
 * keyGenerator the library's trust-proxy validations don't apply and are
 * disabled for clarity.  Uses the default in-memory (per-dyno) store.  Over-limit
 * requests throw a 429 through the central error handler (which drains the body
 * with a short timeout), same as the other guards — no `Connection: close`.
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
  handler: (req, res, next) => next(new TooManyRequests("Too many requests")),
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
 * Rejects all POST requests.
 *
 * @function rejectPostRequests
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 * @throws {MethodNotAllowed}
 */
const rejectPostRequests = (req, res, next) => {
  if (req.method === "POST") {
    throw new MethodNotAllowed("POST is not supported on this server");
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
  isPrivateOrReservedIp,
  matchesBlockedRequest,
  blockRequests,
  isStaticAssetPath,
  makeRateLimiter,
  allowPublicReadOnlyCors,
  rejectParentTraversals,
  rejectPostRequests,
};
