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
  "/dengue",
  "/ebola",
  "/enterovirus",
  "/flu",
  "/lassa",
  "/measles",
  "/mers",
  "/mumps",
  "/monkeypox", // Not actively updated, but YYYY-MM-DD URLs remain & don't redirect
  "/mpox",      // monkeypox URLs will redirect to /mpox (except for datestamped URLs)
  "/ncov",
  "/nextclade",
  "/rsv",
  "/tb",
  "/WNV",
  "/yellow-fever",
  "/zika",
];

const coreBuildRoutes = coreBuildPaths.map(path => [
  path,
  `${path}/*`,
  `${path}:*`, // Tangletrees at top-level, e.g. /a:/a/b
]);


export function setup(app) {
  app.use([coreBuildRoutes, "/narratives/*"], setSource(req => new CoreSource())); // eslint-disable-line no-unused-vars

  app.routeAsync(coreBuildRoutes)
    .all(setDataset(req => req.path), canonicalizeDataset(path => `/${path}`))
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
