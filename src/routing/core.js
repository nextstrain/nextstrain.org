import url from 'url';

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
   * The data here is a superset of the pathogen keys in `manifest_guest.json`
   * and we could (should) reduce the duplication.
   *
   * As of 2024-12 this list includes 2 paths not in the manifest: 'monkeypox',
   * and 'mers'
   */
  "/avian-flu",
  "/dengue",
  "/ebola",
  "/enterovirus",
  "/hmpv",
  "/lassa",
  "/measles",
  "/mers",
  "/mumps",
  "/monkeypox", // Not actively updated, but YYYY-MM-DD URLs remain & don't redirect
  "/mpox",      // monkeypox URLs will redirect to /mpox (except for datestamped URLs)
  "/ncov",
  "/nextclade",
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

const coreBuildRoutes = coreBuildPaths.map(path => [
  path,
  `${path}/*`,
  `${path}:*`, // Tangletrees at top-level, e.g. /a:/a/b
  `${path}@*`, // version (date) descriptors for a top-level build
]);


export function setup(app) {
  app.use([coreBuildRoutes, "/narratives/*"], setSource(req => new CoreSource())); // eslint-disable-line no-unused-vars

  app.routeAsync(coreBuildRoutes)
    .all(
      setDataset(req => req.path),
      canonicalizeDataset((req, path) => url.format({pathname: `/${path}`, query: req.query}))
    )
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
