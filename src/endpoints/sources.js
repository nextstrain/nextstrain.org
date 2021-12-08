/* eslint-disable no-multi-spaces */

/* Rationale:
 *   no-multi-spaces: Alignment makes for easier reading
 */

const {parse: parseContentType} = require("content-type");
const {Forbidden, InternalServerError, NotFound, Unauthorized, UnsupportedMediaType} = require("http-errors");
const negotiateMediaType = require("negotiator/lib/mediaType");
const stream = require("stream");
const {promisify} = require("util");
const zlib = require("zlib");
const readStream = require("raw-body");

const {contentTypesProvided, contentTypesConsumed} = require("../negotiate");
const {fetch, Request} = require("../fetch");
const sources = require("../sources");
const utils = require("../utils");
const {sendAuspiceEntrypoint} = require("./static");


/* XXX TODO: Replace promisify() with require("stream/promises") once we
 * upgrade to Node 15+.
 *   -trs, 5 Nov 2021
 */
const pipeline = promisify(stream.pipeline);


/**
 * Generate Express middleware that instantiates a {@link Source} instance and
 * stashes it in the request context.
 *
 * @param {String} sourceName - Name of a source (from `src/sources.js`)
 * @param {argsExtractor} [argsExtractor] - Function to extract {@link Source}
 *   constructor arguments from the request
 * @returns {expressMiddleware}
 */
// eslint-disable-next-line no-unused-vars
const setSource = (sourceName, argsExtractor = (req) => []) => (req, res, next) => {
  const Source = sources.get(sourceName);

  if (!Source) throw new NotFound();

  const source = new Source(...argsExtractor(req));

  res.vary("Accept");

  if (!source.visibleToUser(req.user)) {
    if (!req.user) {
      if (req.accepts("html")) {
        utils.verbose(`Redirecting anonymous user to login page from ${req.originalUrl}`);
        req.session.afterLoginReturnTo = req.originalUrl;
        return res.redirect("/login");
      }
      throw new Unauthorized();
    }
    throw new Forbidden();
  }

  req.context.source = source;
  return next();
};


/* XXX TODO: Remove setGroupSource() once we move from one source per group to
 * one source parameterized by group name, which will enable us to use the
 * standard setSource() like so:
 *
 *    app.use("/groups/:groupName", setSource("group", req => req.params.groupName))
 *
 *   -trs, 25 Oct 2021
 */
/**
 * Generate Express middleware that instantiates a {@link Source} instance for
 * a group and stashes it in the request context.
 *
 * @param {nameExtractor} nameExtractor - Function to extract the group name from the request
 * @returns {expressMiddleware}
 */
const setGroupSource = (nameExtractor) => (req, res, next) => {
  const groupName = nameExtractor(req);
  const Source = sources.get(groupName);

  // Don't allow group names that happen to be non-group source names.
  if (!Source || !Source.isGroup()) throw new NotFound();

  return setSource(groupName)(req, res, next);
};


/* Datasets
 */

/**
 * Generate Express middleware that instantiates a {@link Dataset} instance and
 * stashes it in the request context.
 *
 * @param {pathExtractor} pathExtractor - Function to extract a dataset path from the request
 * @returns {expressMiddleware}
 */
const setDataset = (pathExtractor) => (req, res, next) => {
  req.context.dataset = req.context.source.dataset(pathParts(pathExtractor(req)));
  next();
};


/**
 * Generate Express middleware that redirects to the canonical path for the
 * current {@link Dataset} if it is not fully resolved.
 *
 * @param {pathBuilder} pathBuilder - Function to build a fully-specified path
 * @returns {expressMiddleware}
 */
const canonicalizeDataset = (pathBuilder) => (req, res, next) => {
  const dataset = req.context.dataset;
  const resolvedDataset = dataset.resolve();

  if (dataset === resolvedDataset) return next();

  /* 307 Temporary Redirect preserves request method, unlike 302 Found, which
   * is important since this middleware function may be used in non-GET routes.
   */
  return res.redirect(307, pathBuilder(resolvedDataset.pathParts.join("/")));
};


/**
 * Express middleware function that throws a {@link NotFound} error if {@link
 * Dataset#exists} returns false.
 *
 * @type {expressMiddlewareAsync}
 */
const ifDatasetExists = async (req, res, next) => {
  if (!(await req.context.dataset.exists())) throw new NotFound();
  return next();
};


/* GET
 */

/* XXX TODO: Support automatically translating v1 (meta and tree) to v2
 * (main) if the latter is requested but only the former is available?
 * We could, but maybe not worth it for these new endpoints, unless/until we
 * want to point Auspice at these endpoints and still support v1.
 *   -trs, 22 Nov 2021
 */
const sendDatasetSubresource = type =>
  sendSubresource(req => req.context.dataset.subresource(type));


const getDatasetSubresource = type => contentTypesProvided([
  [`application/vnd.nextstrain.dataset.${type}+json`, sendDatasetSubresource(type)],
  ["application/json", sendDatasetSubresource(type)],
]);


const getDatasetMain           = getDatasetSubresource("main");
const getDatasetRootSequence   = getDatasetSubresource("root-sequence");
const getDatasetTipFrequencies = getDatasetSubresource("tip-frequencies");


const getDataset = contentTypesProvided([
  ["text/html", ifDatasetExists, sendAuspiceEntrypoint],
  ["application/json", getDatasetMain],
  ["application/vnd.nextstrain.dataset.main+json", getDatasetMain],
  ["application/vnd.nextstrain.dataset.root-sequence+json", getDatasetRootSequence],
  ["application/vnd.nextstrain.dataset.tip-frequencies+json", getDatasetTipFrequencies],

  /* XXX TODO: Support v1 (meta and tree) too?  We could, but maybe ok to say
   * "just v2" for these new endpoints.
   *   -trs, 22 Nov 2021
   */
]);


/* PUT
 */
const receiveDatasetSubresource = type =>
  receiveSubresource(req => req.context.dataset.subresource(type));


const putDatasetSubresource = type => contentTypesConsumed([
  [`application/vnd.nextstrain.dataset.${type}+json`, receiveDatasetSubresource(type)],
]);


const putDatasetMain           = putDatasetSubresource("main");
const putDatasetRootSequence   = putDatasetSubresource("root-sequence");
const putDatasetTipFrequencies = putDatasetSubresource("tip-frequencies");


const putDataset = contentTypesConsumed([
  ["application/vnd.nextstrain.dataset.main+json", putDatasetMain],
  ["application/vnd.nextstrain.dataset.root-sequence+json", putDatasetRootSequence],
  ["application/vnd.nextstrain.dataset.tip-frequencies+json", putDatasetTipFrequencies],

  /* XXX TODO: Support v1 (meta and tree) too?  We could, but maybe ok to say
   * "just v2" for these new endpoints.
   *   -trs, 22 Nov 2021
   */
]);


/* DELETE
 */

/**
 * Generate an Express endpoint that deletes a dataset or narrative Resource
 * determined by the request.
 *
 * Internally, the Resource is deleted by deleting all of its Subresources.
 *
 * @param {resourceExtractor} resourceExtractor - Function to provide the Resource instance from the request
 * @returns {expressEndpointAsync}
 */
const deleteResource = resourceExtractor => async (req, res) => {
  const resource = resourceExtractor(req);

  const method = "DELETE";
  const upstreamUrls = await Promise.all(resource.subresources().map(s => s.url(method)));
  const upstreamResponses = await Promise.all(upstreamUrls.map(url => fetch(url, {method})));

  const goodStatuses = new Set([204, 404]);

  if (!upstreamResponses.every(r => goodStatuses.has(r.status))) {
    throw new InternalServerError("failed to delete all subresources");
  }

  return res.status(204).end();
};


const deleteDataset = deleteResource(req => req.context.dataset);
const deleteNarrative = deleteResource(req => req.context.narrative);


/* Narratives
 */

/**
 * Generate Express middleware that instantiates a {@link Narrative} instance
 * and stashes it in the request context.
 *
 * @param {pathExtractor} pathExtractor - Function to extract a narrative path from the request
 * @returns {expressMiddleware}
 */
const setNarrative = (pathExtractor) => (req, res, next) => {
  req.context.narrative = req.context.source.narrative(pathParts(pathExtractor(req)));
  next();
};


/**
 * Express middleware function that throws a {@link NotFound} error if {@link
 * Narrative#exists} returns false.
 *
 * @type {expressMiddlewareAsync}
 */
const ifNarrativeExists = async (req, res, next) => {
  if (!(await req.context.narrative.exists())) throw new NotFound();
  return next();
};


/* GET
 */
const sendNarrativeSubresource = type =>
  sendSubresource(req => req.context.narrative.subresource(type));


const getNarrativeMarkdown = contentTypesProvided([
  ["text/vnd.nextstrain.narrative+markdown", sendNarrativeSubresource("md")],
  ["text/markdown", sendNarrativeSubresource("md")],
]);


const getNarrative = contentTypesProvided([
  ["text/html", ifNarrativeExists, sendAuspiceEntrypoint],
  ["text/markdown", getNarrativeMarkdown],
  ["text/vnd.nextstrain.narrative+markdown", getNarrativeMarkdown],
]);


/* PUT
 */
const receiveNarrativeSubresource = type =>
  receiveSubresource(req => req.context.narrative.subresource(type));


const putNarrativeMarkdown = contentTypesConsumed([
  ["text/vnd.nextstrain.narrative+markdown", receiveNarrativeSubresource("md")],
]);


const putNarrative = contentTypesConsumed([
  ["text/vnd.nextstrain.narrative+markdown", putNarrativeMarkdown],
]);


/**
 * Split a dataset or narrative `path` into an array of parts.
 *
 * If `path` is a tangletree path (i.e. refers to two datasets), returns only
 * the parts for the first dataset.
 *
 * @param {String} path
 * @returns {String[]}
 */
function pathParts(path = "") {
  const normalizedPath = path
    .split(":")[0]          // Use only the first dataset in a tangletree (dual dataset) path.
    .replace(/^\/+/, "")    // Ignore leading slashes
    .replace(/\/+$/, "")    //   …and trailing slashes.
  ;

  if (!normalizedPath) return [];

  return normalizedPath.split("/");
}


/**
 * Generate an Express endpoint that sends a dataset or narrative Subresource
 * determined by the request.
 *
 * @param {subresourceExtractor} subresourceExtractor - Function to provide the Subresource instance from the request
 * @returns {expressEndpointAsync}
 */
function sendSubresource(subresourceExtractor) {
  return async (req, res) => {
    const subresource = subresourceExtractor(req);
    const subresourceUrl = await subresource.url();

    /* Proxy the data through us:
     *
     *    client (browser, CLI, etc) ⟷ us (nextstrain.org) ⟷ upstream source
     */
    return await proxyResponseBodyFromUpstream(req, res, new Request(subresourceUrl, {
      headers: {
        Accept: subresource.accept,

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
  };
}


/**
 * Generate an Express endpoint that receives a dataset or narrative
 * Subresource determined by the request.
 *
 * @param {subresourceExtractor} subresourceExtractor - Function to provide the Subresource instance from the request
 * @returns {expressEndpointAsync}
 */
function receiveSubresource(subresourceExtractor) {
  return async (req, res) => {
    const method = "PUT";
    const subresource = subresourceExtractor(req);

    /* Proxy the data through us:
     *
     *    client (browser, CLI, etc) ⟷ us (nextstrain.org) ⟷ upstream source
     */
    // eslint-disable-next-line prefer-const
    let headers = {
      "Content-Type": subresource.mediaType,
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
     * body into memory so we can calculate length for S3.
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

    const subresourceUrl = await subresource.url(method, {
      "Content-Type": headers["Content-Type"],
      "Content-Encoding": headers["Content-Encoding"],
    });

    const upstreamRes = await fetch(subresourceUrl, {method, body, headers});

    switch (upstreamRes.status) {
      case 200:
      case 204:
        break;

      default:
        throw new InternalServerError(`upstream said: ${upstreamRes.status} ${upstreamRes.statusText}`);
    }

    return res.status(204).end();
  };
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
  ];

  res.set(copyHeaders(upstreamRes.headers, forwardedUpstreamResHeaders));

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
    await pipeline(upstreamRes.body, zlib.createGunzip(), res);
  } else {
    await pipeline(upstreamRes.body, res);
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
      .filter(([name, value]) => value != null && value !== "") // eslint-disable-line no-unused-vars
  );
}


/**
 * @callback argsExtractor
 * @param {express.request} req
 * @returns {Array} Arguments for a {@link Source} constructor.
 */

/**
 * @callback nameExtractor
 * @param {express.request} req
 * @returns {String} Name of a Group
 */

/**
 * @callback pathExtractor
 * @param {express.request} req
 * @returns {String} Path for {@link Source#dataset} or {@link Source#narrative}
 */

/**
 * @callback pathBuilder
 * @param {String} path - Canonical path for the dataset within the context of
 *   the current {@link Source}
 * @returns {String} Fully-specified path to redirect to
 */

/**
 * @callback subresourceExtractor
 * @param {express.request} req
 * @returns {module:../sources/models.Subresource} A Subresource instance.
 */

/**
 * @callback resourceExtractor
 * @param {express.request} req
 * @returns {module:../sources/models.Resource} A Resource instance.
 */

/**
 * @callback expressMiddleware
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 */

/**
 * @callback expressMiddlewareAsync
 * @async
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 */

/**
 * @callback expressEndpointAsync
 * @async
 * @param {express.request} req
 * @param {express.response} res
 */


module.exports = {
  setSource,
  setGroupSource,

  setDataset,
  canonicalizeDataset,
  ifDatasetExists,
  getDataset,
  putDataset,
  deleteDataset,

  setNarrative,
  ifNarrativeExists,
  getNarrative,
  putNarrative,
  deleteNarrative,
};
