import { NotFound } from '../httpErrors.js';

import * as authz from '../authz/index.js';
import { contentTypesProvided, contentTypesConsumed } from '../negotiate.js';
import * as options from './options.js';
import { sendAuspiceEntrypoint } from './static.js';
import { deleteByUrls, proxyFromUpstream, proxyToUpstream } from "../upstream.js";


/**
 * Generate Express middleware that extracts a {@link Source} instance from the
 * request and stashes it in the request context.
 *
 * @param {sourceExtractor} sourceExtractor - Function to extract {@link Source}
 *   instance from the request
 * @returns {expressMiddleware}
 */
export const setSource = (sourceExtractor) => (req, res, next) => {
  const source = sourceExtractor(req);

  authz.assertAuthorized(req.user, authz.actions.Read, source);

  req.context.source = source;
  return next();
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
export const setDataset = (pathExtractor) => (req, res, next) => {
  req.context.dataset = req.context.source.dataset(...pathParts(pathExtractor(req)));
  next();
};


/**
 * Generate Express middleware that redirects to the canonical path for the
 * current {@link Dataset} if it is not fully resolved.
 *
 * @param {pathBuilder} pathBuilder - Function to build a fully-specified path
 * @returns {expressMiddleware}
 */
export const canonicalizeDataset = (pathBuilder) => (req, res, next) => {
  const dataset = req.context.dataset;
  const resolvedDataset = dataset.resolve();

  if (dataset === resolvedDataset) return next();

  const canonicalPath = pathBuilder.length >= 2
    ? pathBuilder(req, resolvedDataset.pathParts.join("/"))
    : pathBuilder(resolvedDataset.pathParts.join("/"));

  /* 307 Temporary Redirect preserves request method, unlike 302 Found, which
   * is important since this middleware function may be used in non-GET routes.
   */
  return res.redirect(307, canonicalPath);
};


/**
 * Express middleware function that throws a {@link NotFound} error if {@link
 * Dataset#exists} returns false.
 *
 * @type {expressMiddlewareAsync}
 */
export const ifDatasetExists = async (req, res, next) => {
  authz.assertAuthorized(req.user, authz.actions.Read, req.context.dataset);

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
export const sendDatasetSubresource = type =>
  sendSubresource(req => req.context.dataset.subresource(type));


const getDatasetSubresource = type => contentTypesProvided([
  [`application/vnd.nextstrain.dataset.${type}+json`, sendDatasetSubresource(type)],
  ["application/json", sendDatasetSubresource(type)],
]);


const getDatasetMain           = getDatasetSubresource("main");
const getDatasetRootSequence   = getDatasetSubresource("root-sequence");
const getDatasetTipFrequencies = getDatasetSubresource("tip-frequencies");
const getDatasetMeasurements   = getDatasetSubresource("measurements");


export const getDataset = contentTypesProvided([
  ["text/html", ifDatasetExists, sendAuspiceEntrypoint],
  ["application/json", getDatasetMain],
  ["application/vnd.nextstrain.dataset.main+json", getDatasetMain],
  ["application/vnd.nextstrain.dataset.root-sequence+json", getDatasetRootSequence],
  ["application/vnd.nextstrain.dataset.tip-frequencies+json", getDatasetTipFrequencies],
  ["application/vnd.nextstrain.dataset.measurements+json", getDatasetMeasurements],

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
const putDatasetMeasurements   = putDatasetSubresource("measurements");


export const putDataset = contentTypesConsumed([
  ["application/vnd.nextstrain.dataset.main+json", putDatasetMain],
  ["application/vnd.nextstrain.dataset.root-sequence+json", putDatasetRootSequence],
  ["application/vnd.nextstrain.dataset.tip-frequencies+json", putDatasetTipFrequencies],
  ["application/vnd.nextstrain.dataset.measurements+json", putDatasetMeasurements],

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

  authz.assertAuthorized(req.user, authz.actions.Write, resource);

  const method = "DELETE";
  const upstreamUrls = await Promise.all(resource.subresources().map(s => s.url(method)));
  await deleteByUrls(upstreamUrls);

  return res.status(204).end();
};


export const deleteDataset = deleteResource(req => req.context.dataset);
export const deleteNarrative = deleteResource(req => req.context.narrative);


/* OPTIONS
 */
export const optionsDataset = options.forAuthzObject(req => req.context.dataset);
export const optionsNarrative = options.forAuthzObject(req => req.context.narrative);


/* Narratives
 */

/**
 * Generate Express middleware that instantiates a {@link Narrative} instance
 * and stashes it in the request context.
 *
 * @param {pathExtractor} pathExtractor - Function to extract a narrative path from the request
 * @returns {expressMiddleware}
 */
export const setNarrative = (pathExtractor) => (req, res, next) => {
  req.context.narrative = req.context.source.narrative(...pathParts(pathExtractor(req)));
  next();
};


/**
 * Express middleware function that throws a {@link NotFound} error if {@link
 * Narrative#exists} returns false.
 *
 * @type {expressMiddlewareAsync}
 */
export const ifNarrativeExists = async (req, res, next) => {
  authz.assertAuthorized(req.user, authz.actions.Read, req.context.narrative);

  if (!(await req.context.narrative.exists())) throw new NotFound();
  return next();
};


/* GET
 */
export const sendNarrativeSubresource = type =>
  sendSubresource(req => req.context.narrative.subresource(type));


const getNarrativeMarkdown = contentTypesProvided([
  ["text/vnd.nextstrain.narrative+markdown", sendNarrativeSubresource("md")],
  ["text/markdown", sendNarrativeSubresource("md")],
]);


export const getNarrative = contentTypesProvided([
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


export const putNarrative = contentTypesConsumed([
  ["text/vnd.nextstrain.narrative+markdown", putNarrativeMarkdown],
]);


/**
 * Split a dataset or narrative `path` into an array of parts and a version
 * descriptor.
 *
 * If `path` is a tangletree path (i.e. refers to two datasets), returns only
 * the parts for the first dataset.
 *
 * We always attempt to extract a version descriptor from the provided path,
 * returning false if one is not present.
 *
 * @param {String} path
 * @returns {[String[], (String|false)]} [0]: array of path parts, [1]: version
 * descriptor
 */
function pathParts(path = "") {
  // Use only the first dataset in a tangletree (dual dataset) path.
  let normalizedPath = path.split(":")[0]          

  /* The part of the path starting with "@" is the version descriptor - this
  will later be mapped to the appropriate fetch URL (e.g. S3 version ID) via the
  resource index. The version descriptor is greedy and may itself include '@'
  characters. Note that '@' characters may be present in the URL path but not in
  the `path` argument here. */

  let rest;
  [normalizedPath, ...rest] = normalizedPath.split("@");
  const versionDescriptor = rest.join("@") || false;

  // Ignore leading & trailing slashes (after version descriptor removal)
  normalizedPath = normalizedPath
    .replace(/\/+$/, "")
    .replace(/^\/+/, "");

  const nameParts = normalizedPath ? normalizedPath.split("/") : [];

  return [nameParts, versionDescriptor]
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

    authz.assertAuthorized(req.user, authz.actions.Read, subresource.resource);

    return await proxyFromUpstream(req, res,
      await subresource.url(),
      subresource.accept
    );
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
    const subresource = subresourceExtractor(req);

    authz.assertAuthorized(req.user, authz.actions.Write, subresource.resource);

    /* Notify the client they can continue sending the request body now that
     * we're past authz.
     */
    if (req.expectsContinue) res.writeContinue();

    return proxyToUpstream(req, res,
      async (method, headers) => await subresource.url(method, headers),
      subresource.mediaType
    );
  };
}


/**
 * @callback sourceExtractor
 * @param {express.request} req
 * @returns {Source} A {@link Source} instance.
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

/* Confused about the duplication below?  It's the documented way to handle
 * overloaded (e.g. arity-dependent) function signatures.¹  Note that it relies
 * on the "nestled" or "cuddled" end and start comment markers.
 *   -trs, 16 June 2022
 *
 * ¹ https://github.com/jsdoc/jsdoc/issues/1017
 */
/**
 * @callback pathBuilder
 *
 * @param {String} path - Canonical path for the dataset within the context of
 *   the current {@link Source}
 * @returns {String} Fully-specified path to redirect to
 *//**
* @callback pathBuilder
*
* @param {express.request} req
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
