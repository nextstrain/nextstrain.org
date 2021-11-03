const {Forbidden, NotFound} = require("http-errors");

const sources = require("@./src/sources");
const utils = require("@./src/utils");


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

  if (!source.visibleToUser(req.user)) {
    if (!req.user) {
      utils.verbose(`Redirecting anonymous user to login page from ${req.originalUrl}`);
      req.session.afterLoginReturnTo = req.originalUrl;
      return res.redirect("/login");
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
 * @type {expressMiddleware}
 */
const ifDatasetExists = async (req, res, next) => {
  if (!(await req.context.dataset.exists())) throw new NotFound();
  next();
};


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
 * @type {expressMiddleware}
 */
const ifNarrativeExists = async (req, res, next) => {
  if (!(await req.context.narrative.exists())) throw new NotFound();
  next();
};


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
 * @callback expressMiddleware
 * @param {express.request} req
 * @param {express.response} res
 * @param {Function} next
 */


module.exports = {
  setSource,
  setGroupSource,

  setDataset,
  canonicalizeDataset,
  ifDatasetExists,

  setNarrative,
  ifNarrativeExists,
};
