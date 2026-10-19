import * as endpoints from '../endpoints/index.js';
import * as sources from '../sources/index.js';

const {
  setSource,
  setDataset,
  setNarrative,
  canonicalizeDataset,
  getDataset,
  putDataset,
  deleteDataset,
  optionsDataset,
  getNarrative,
  putNarrative,
  deleteNarrative,
  optionsNarrative,
} = endpoints.sources;

const {
  CoreSource,
} = sources;

const coreBuildPaths = [
  /**
   * The data here is a superset of the pathogen keys in `manifest_core.json`
   * and we could (should) reduce the duplication.
   *
   * As of 2024-12 this list includes 2 paths not in the manifest: 'monkeypox',
   * and 'mers'
   */
  "/avian-flu",
  "/chikv",
  "/dengue",
  "/ebola",
  "/enterovirus",
  "/hantavirus",
  "/hmpv",
  "/lassa",
  "/measles",
  "/mers",
  "/mumps",
  "/monkeypox", // Not actively updated, but YYYY-MM-DD URLs remain & don't redirect
  "/mpox",      // monkeypox URLs will redirect to /mpox (except for datestamped URLs)
  "/ncov",
  "/nipah",
  "/norovirus",
  "/oropouche",
  "/rabies",
  "/rsv",
  "/rubella",
  "/seasonal-cov",
  "/seasonal-flu",
  "/tb",
  "/WNV",
  "/yellow-fever",
  "/zika",
];

/**
 * Core build paths whose bare URL (e.g. `/ebola`) should _not_ be handled here
 * but instead fall through to the Next.js static site, which serves a bespoke
 * landing page at that path.
 */
const staticPagePaths = new Set([
  "/ebola",
]);

const coreBuildRoutes = coreBuildPaths.map(path => [
  ...(staticPagePaths.has(path) ? [] : [path]),
  `${path}/*`,
  ...(staticPagePaths.has(path) ? [] : [`${path}:*`]), // Tangletrees at top-level, e.g. /a:/a/b
  ...(staticPagePaths.has(path) ? [] : [`${path}@*`]), // version (date) descriptors for a top-level build
]);


export function setup(app) {
  app.use([coreBuildRoutes, "/narratives/*"], setSource(req => new CoreSource())); // eslint-disable-line no-unused-vars

  app.routeAsync(coreBuildRoutes)
    .allAsync(setDataset(req => req.path), canonicalizeDataset(path => `/${path}`))
    .getAsync(getDataset)
    .putAsync(putDataset)
    .deleteAsync(deleteDataset)
    .optionsAsync(optionsDataset)
  ;

  app.routeAsync("/narratives/*")
    .all(setNarrative(req => req.params[0]))
    .getAsync(getNarrative)
    .putAsync(putNarrative)
    .deleteAsync(deleteNarrative)
    .optionsAsync(optionsNarrative)
  ;
}
