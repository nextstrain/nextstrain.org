const fetch = require("node-fetch");
const sources = require("./src/sources");
const { splitPrefixIntoParts, parsePrefix } = require("./src/getDatasetHelpers");

/**
 * Auspice core builds have URLs where the first (`/`-separated) field matches the following list.
 * New core builds must be added here else they will be routed to Gatsby.
 * This could be dynamically generated at server start time via a S3 API call if we wish.
 */
const coreBuilds = [
  "/dengue",
  "/ebola",
  "/enterovirus",
  "/flu",
  "/lassa",
  "/measles",
  "/mers",
  "/mumps",
  "/ncov",
  "/tb",
  "/WNV",
  "/yellow-fever",
  "/zika",
];

const groups = [...sources.keys()].filter((k) => !["core", "staging", "community"].includes(k));


/**
 * The following routes _may_ be handled by Auspice.
 * Note: as we add more functionality to Gatsby, this list will shrink
 * (e.g. /staging will be a gatsby page, not an auspice one)
 */
const potentialAuspiceRoutes = [
  "/status",
  "/status/*",
  ...coreBuilds,
  ...coreBuilds.map((url) => url + ":*"),
  ...coreBuilds.map(url => url + "/*"),
  "/narratives",
  "/narratives/*",
  "/staging/*",
  ...groups.map((group) => `/groups/${group}/*`),

  /* Auspice gets specific /community paths so it can show an index of datasets
    * and narratives, but Gatsby gets top-level /community.
    */
  "/community/:user/:repo",
  "/community/:user/:repo/*",

  /* auspice gets /fetch/X URLs which result in loading of dataset accessible at URL X
    * note that gatsby will redirect /fetch to the docs page explaining this behavior
    */
  "/fetch/*"
];

/**
 * Express middleware to examine a path and determine if it should be routed to Auspice
 * for visualization, or sent a Gatsby-generated page.
 * This may require a fetch call for the main dataset (or the meta.json if v1 schema)
 * to decide if a URL is an auspice route or not.
 *
 * SIDE-EFFECTS:
 * Adds the following properties to `req`, which are used by subsequent middleware.
 * `req.sendToAuspice` {bool}
 */
const isRequestBackedByAuspiceDataset = async (req, res, next) => {
  // TODO: this is similar to `getDataset` and so we should refactor that
  // and re-use it here so that we don't let them get out of sync.
  req.sendToAuspice = false; // explicit default
  try {

    /* Previous to April 2021 work, _ALL_ these routes would be handled by Auspice.
    We preserve previous behavior with this block, whilst slowly moving entries out
    as they are build into gatsby.
    (e.g. /groups/blab will not be handled by Auspice in the long run) */
    const pathParts = req.path.replace(/^\//, '').replace(/\/$/, '').split("/");
    if (
      pathParts[0]==="status" ||
      pathParts.includes("narratives") ||
      pathParts[0]==="community" || // note that /community itself is redirected earlier
      pathParts[0]==="fetch"
    ) {
      req.sendToAuspice = true;
      return next();
    }

    const {source, prefixParts} = splitPrefixIntoParts(req.path);
    if (!source.visibleToUser(req.user)) {
      return next();
    }

    /* For URLs which look like core builds we know that the start of the path must match a hardcoded list */
    if (source.name==="core" && !coreBuilds.includes("/"+prefixParts[0])) {
      return next();
    }

    /* Extract dataset information & check if it exists, storing the result as `req.sendToAuspice` */
    const { dataset } = parsePrefix(req.path);
    if (await datasetExists(dataset)) {
      req.sendToAuspice = true;
    }
    return next();
  } catch (err) {
    console.log("isRequestBackedByAuspiceDataset", String(err));
    req.sendToAuspice = false;
    return next();
  }
};

/**
 * Does the main dataset file exist?
 * There is no attempt here to examine the validity or completeness of such a file.
 * @returns {bool}
 */
async function datasetExists(dataset) {
  const options = {method: 'HEAD'}; // only fetch headers to speed up
  try {
    if ((await fetch(dataset.urlFor("main"), options)).status===200) {
      return true;
    }
    if ((await fetch(dataset.urlFor("meta"), options)).status===200) {
      return true;
    }
  } catch (err) {
    // console.log("Error in datasetExists:", String(err));
  }
  return false;
}


module.exports = {
  isRequestBackedByAuspiceDataset,
  potentialAuspiceRoutes
};
