const sources = require("./src/sources");

/* Dataset and narrative paths hit Auspice's entrypoint.
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
  
  const auspicePaths = [
    "/status",
    "/status/*",
    ...coreBuilds,
    ...coreBuilds.map((url) => url + ":*"),
    ...coreBuilds.map(url => url + "/*"),
    "/narratives",
    "/narratives/*",
    "/staging",
    "/staging/*",
    ...groups.map((group) => `/groups/${group}`),
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
  
  module.exports = auspicePaths;
  