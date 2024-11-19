import { parse as parseContentType } from 'content-type';
import negotiateMediaType from 'negotiator/lib/mediaType.js';
import stream from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';
import readStream from 'raw-body';
import { InternalServerError, NotFound, UnsupportedMediaType } from './httpErrors.js';
import { fetch, Request } from './fetch.js';


/* XXX TODO: Replace promisify() with require("stream/promises") once we
 * upgrade to Node 15+.
 *   -trs, 5 Nov 2021
 */
const pipeline = promisify(stream.pipeline);


/**
 * Delete objects by their URLs.
 *
 * @param {String[]} urls - URLs of the objects to be deleted.
 */
async function deleteByUrls(urls) {
  const method = "DELETE";
  const responses = await Promise.all(urls.map(url => fetch(url, {method})));

  const goodStatuses = new Set([204, 404]);

  if (!responses.every(r => goodStatuses.has(r.status))) {
    throw new InternalServerError("At least one delete request failed.");
  }
}


/**
 * Proxy the data through us:
 *
 *    client (browser, CLI, etc) ⟷ us (nextstrain.org) ⟷ upstream source
 *
 * @param {express.request} req - Express-style request instance
 * @param {express.response} res - Express-style response instance
 * @param {String} url - Resource URL
 * @param {String} accept - HTTP Accept header value
 */
async function proxyFromUpstream(req, res, url, accept) {
  return await proxyResponseBodyFromUpstream(req, res, new Request(url, {
    headers: {
      Accept: accept,

      /* Normalize Accept-Encoding to gzip or nothing, as realistically we
       * only expect upstreams to support gzip and normalizing reduces the
       * cache burden of varying on many equivalent but effectively the same
       * client Accept-Encoding values.
       */
      "Accept-Encoding": req.acceptsEncodings("gzip")
        ? "gzip"
        : "identity",
    },

    /* Use "no-cache" mode to always revalidate with the upstream but avoid
     * re-transferring the content if we have a cached copy that matches
     * upstream.
     */
    cache: "no-cache",

    /* Disable automatic body decompression.  Instead, we pass through the
     * Accept-Encoding of the client to the upstream and return the
     * upstream Content-Encoding and body directly.  This avoids needlessly
     * decompressing and recompressing ourselves.
     */
    compress: false,
  }));
}


/**
 * Proxy the data through us:
 *
 *    client (browser, CLI, etc) ⟷ us (nextstrain.org) ⟷ upstream source
 *
 * @param {express.request} req - Express-style request instance
 * @param {express.response} res - Express-style response instance
 * @param {upstreamUrlExtractor} upstreamUrlExtractor - Callback to retrieve resource URL
 * @param {string} contentType - `Content-Type` header value to send
 */
async function proxyToUpstream(req, res, upstreamUrlExtractor, contentType) {
  const method = "PUT";

  // eslint-disable-next-line prefer-const
  let headers = {
    "Content-Type": contentType,
    ...copyHeaders(req, ["Content-Encoding", "Content-Length"]),

    /* XXX TODO: Consider setting Cache-Control rather than relying on
     * ambiguous defaults.  Potentially impacts:
     *
     *   - Our own fetch() caching, including in sendSubresource() above
     *   - Our Charon endpoints, if upstream headers are sent to the browser?
     *   - CloudFront caching (not sure about its default behaviour)
     *   - Browsers, if fetched directly, such as by redirection
     *
     * I think a cautious initial value would be to set "private" or "public"
     * depending on the Source and then always set "must-revalidate,
     * proxy-revalidate, max-age=0".  This would allow caches (ours,
     * browsers, CloudFront?) to store the data but always check upstream
     * with conditional requests.
     *   -trs, 7 Dec 2021
     */
  };

  // Body of the request as a Node stream
  let body = req;

  // Compress on the fly to gzip if it's not already gzip compressed.
  if (!headers["Content-Encoding"]) {
    delete headers["Content-Length"]; // won't be valid after compression
    headers["Content-Encoding"] = "gzip";
    body = body.pipe(zlib.createGzip());
  }

  if (headers["Content-Encoding"] !== "gzip") {
    throw new UnsupportedMediaType("unsupported Content-Encoding; only gzip is supported");
  }

  /* Our upstreams for PUTs are all S3, and S3 requires a Content-Length
   * header (i.e. doesn't accept streaming PUTs).  If we don't have a
   * Content-Length from the request (i.e. the request is a streaming PUT or
   * we're doing on-the-fly compression), then we have to buffer the entire
   * body into memory so we can calculate length for S3.  When passed a
   * buffer instead of a stream, fetch() will calculate Content-Length for us
   * before sending the request.
   *
   * An alternative to buffering the whole body is to use S3's multipart
   * upload API, but the minimum part size is 5MB so some buffering would be
   * required anyway.  Multipart uploads would add inherent complexity at
   * runtime and also design time, as we'd have to rework our data model.
   *
   * In a review of all the (compressed) core and group datasets (nearly
   * 11k), over 99% are less than 5MB and none are more than 15MB.  Given
   * that we'd only be able to use multipart uploads for less than 1% of
   * datasets and even the largest datasets would fit comfortably in memory,
   * it doesn't seem worth implementing.
   *
   * Allow buffering up to 20MB of data after gzip compression (guaranteed by
   * Content-Encoding handling above).  Requests that exceed this will get a
   * 413 error (thrown by readStream()), and if this becomes an issue we can
   * consider bumping the limit.  Clients also have the option of
   * pre-compressing the data and including a Content-Length themselves so we
   * don't have to buffer it, in which case we don't limit request sizes.
   *   -trs, 21 Jan 2022
   */
  if (!headers["Content-Length"]) {
    body = await readStream(body, { limit: 20_000_000 /* 20MB */ });
  }

  const url = await upstreamUrlExtractor(method, {
    "Content-Type": headers["Content-Type"],
    "Content-Encoding": headers["Content-Encoding"],
  });

  const upstreamRes = await fetch(url, {method, body, headers});

  switch (upstreamRes.status) {
    case 200:
    case 204:
      break;

    default:
      throw new InternalServerError(`upstream said: ${upstreamRes.status} ${upstreamRes.statusText}`);
  }

  return res.status(204).end();
}


/**
 * Fetch from an upstream server and stream the response body back through as
 * our own response body.
 *
 * Only 200 and 304 responses are passed through.  403 and 404 statuses are
 * raised as 404s.  Everything else raises a 500.
 *
 * If our upstream request included an `Accept` header, makes sure the upstream
 * response satisfies it.
 *
 * @param {express.request} req - Express-style request instance
 * @param {express.response} res - Express-style response instance
 * @param {Response} upstreamReq - Request instance (WHATWG fetch()-style) for
 *    the upstream resource
 */
async function proxyResponseBodyFromUpstream(req, res, upstreamReq) {
  const upstreamRes = await fetch(upstreamReq);

  switch (upstreamRes.status) {
    case 200:
    case 304:
      break;

    case 403:
    case 404:
      throw new NotFound();

    default:
      throw new InternalServerError(`upstream said: ${upstreamRes.status} ${upstreamRes.statusText}`);
  }

  /* Check that the upstream returned something acceptable to us.  This ensures
   * we honor the content negotiation for our own response.
   */
  const accept      = upstreamReq.headers.get("Accept");
  const contentType = upstreamRes.headers.get("Content-Type");

  if (!acceptableContentType(accept, contentType)) {
    throw new InternalServerError(`source response has unacceptable Content-Type: ${contentType}`);
  }

  const forwardedUpstreamResHeaders = [
    /* It's ok to forward the ETag back without weakening it (W/…) even if
     * upstreamReq.compress is enabled, because though local decoding of the
     * Content-Encoding renders a strong ETag incorrect, this incorrectness
     * (and potentially buggy caching) would only be visible to the client if
     * they also made direct requests to our upstream using the same ETag.
     * That is not a situation we need to worry about.  As long the local
     * decompression behaviour we use is always the same and not different for
     * the same client at different times, then the same ETag won't be sent for
     * two different response versions.
     *   -trs, 7 Dec 2021
     */
    "ETag",
    "Last-Modified",
    "Content-Length",

    /* Forward Content-Encoding if local decompression was disabled so the
     * client can decode the body itself.
     */
    ...(!upstreamReq.compress ? ["Content-Encoding"] : []),

    /* Forward Content-Type if our response doesn't already have a preferred
     * type set (e.g. from prior content negotiation).
     */
    ...(!res.get("Content-Type") ? ["Content-Type"] : []),
  ];

  res.set(copyHeaders(upstreamRes.headers, forwardedUpstreamResHeaders));

  /* Allow private (e.g. browser) caches to store this response, but require
   * them to revalidate it every time before use.  They'll make conditional
   * requests which we can respond to quickly from our own server-side cache.
   */
  res.set("Cache-Control", "private, no-cache");

  /* Check if the request conditions (e.g. If-None-Match) are satisfied (e.g.
   * against our response ETag) and short-circuit with a 304 if we can!
   */
  if (req.fresh) {
    // Remove headers about the body, which we aren't sending now.
    res.removeHeader("Content-Type");
    res.removeHeader("Content-Length");
    res.removeHeader("Content-Encoding");
    return res.status(304).end();
  }

  /* Most of our upstreams send unconditional Content-Encoding: gzip responses,
   * which is fine for browsers because all browsers support gzip, but not all
   * API clients may by default (e.g. curl doesn't without the --compressed
   * option).  Play nice by decompressing the response if necessary.  This
   * could be a global middleware, but punting on that for now as it's a bit
   * more fiddly.  (My ideal would be if our existing "compression()"
   * middleware also handled this case, so maybe an upstream patch is in
   * order.)
   *   -trs, 9 Dec 2021
   */
  if (res.get("Content-Encoding") === "gzip" && !req.acceptsEncodings("gzip")) {
    res.removeHeader("Content-Encoding");
    res.removeHeader("Content-Length");

    // Weaken any strong ETag since we're now modifying response body
    const etag = res.get("ETag");
    if (etag && !etag.startsWith("W/")) res.set("ETag", `W/${etag}`);

    await pipeline(upstreamRes.body, zlib.createGunzip(), res);
  } else {
    try {
      await pipeline(upstreamRes.body, res);
    } catch (err) {
      /* Nothing we can do about the client closing the connection on us before
       * we were "ready"; see rationale in commit message introducing this
       * handling.
       *   -trs, 15 July 2022
       */
      if (err?.code !== 'ERR_STREAM_PREMATURE_CLOSE') throw err;
    }
  }

  return res.end();
}


/**
 * Checks if the `Content-Type` of a response satisfies the `Accept` of a
 * request.
 *
 * If `accept` is falsey (i.e. the request accepts anything), returns `true`.
 *
 * If `contentType` is falsey or invalid (i.e. we don't know what type the
 * response data is), returns `false`.
 *
 * @param {string} accept - `Accept` header value from a request
 * @param {string} contentType - `Content-Type` header value from the related response
 * @returns {boolean}
 */
function acceptableContentType(accept, contentType) {
  if (!accept) return true;
  if (!contentType) return false;

  let mediaType;

  try {
    mediaType = parseContentType(contentType).type;
  } catch (err) {
    // parseContentType() throws a TypeError if contentType is bogus
    if (!(err instanceof TypeError)) {
      throw err;
    }
  }

  if (!mediaType) return false;

  return negotiateMediaType(accept, [mediaType]).length > 0;
}


/**
 * Copy a given list of headers from a source object into a new object,
 * omitting any without a value.
 *
 * @param {express.request|express.response|fetch.Headers} headerSource -
 *   Express request/response object or WHATWG Fetch API Headers object from
 *   which to copy headers.
 *
 * @param {String[]} headerNames - Array of header names to copy from the source object
 *
 * @returns {Object}
 */
function copyHeaders(headerSource, headerNames) {
  return Object.fromEntries(
    headerNames
      .map(name => [name, headerSource.get(name)])
      .filter(([name, value]) => value !== null && value !== "") // eslint-disable-line no-unused-vars
  );
}


/**
 * @callback upstreamUrlExtractor
 * @async
 * @param {string} method - HTTP method
 * @param {Object} headers - HTTP headers
 */


export {
  deleteByUrls,
  proxyFromUpstream,
  proxyToUpstream,
};
