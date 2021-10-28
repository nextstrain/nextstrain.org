const sources = require("./sources");

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

const groups = Array.from(sources.entries())
  .filter(([, Source]) => Source.isGroup())
  .map(([name, ]) => name); // eslint-disable-line


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


module.exports = {
  potentialAuspiceRoutes
};
