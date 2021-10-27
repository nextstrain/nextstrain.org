const {Forbidden, NotFound} = require("http-errors");

const sources = require("../sources");
const utils = require("../utils");


/* Source
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
const setGroupSource = (nameExtractor) => (req, res, next) => {
  const groupName = nameExtractor(req);
  const Source = sources.get(groupName);

  // Don't allow group names that happen to be non-group source names.
  if (!Source || !Source.isGroup()) throw new NotFound();

  return setSource(groupName)(req, res, next);
};


/* Datasets
 */
const setDataset = (pathExtractor) => (req, res, next) => {
  req.context.dataset = req.context.source.dataset(pathParts(pathExtractor(req)));
  next();
};


const canonicalizeDataset = (pathBuilder) => (req, res, next) => {
  const dataset = req.context.dataset;
  const resolvedDataset = dataset.resolve();

  if (dataset === resolvedDataset) return next();

  /* 307 Temporary Redirect preserves request method, unlike 302 Found, which
   * is important since this middleware function may be used in non-GET routes.
   */
  return res.redirect(307, pathBuilder(resolvedDataset.pathParts.join("/")));
};


const ifDatasetExists = async (req, res, next) => {
  if (!(await req.context.dataset.exists())) throw new NotFound();
  next();
};


/* Narratives
 */
const setNarrative = (pathExtractor) => (req, res, next) => {
  req.context.narrative = req.context.source.narrative(pathParts(pathExtractor(req)));
  next();
};


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


module.exports = {
  setSource,
  setGroupSource,

  setDataset,
  canonicalizeDataset,
  ifDatasetExists,

  setNarrative,
  ifNarrativeExists,
};
