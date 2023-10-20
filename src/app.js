const CANARY_ORIGIN = process.env.CANARY_ORIGIN;

import { NotFound } from './httpErrors.js';
import * as endpoints from './endpoints/index.js';
import * as redirects from './redirects.js';
import * as routing from "./routing/index.js";
import { setupApp } from "./routing/setup.js";
import * as sources from './sources/index.js';
import * as utils from './utils/index.js';

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
  CoreStagingSource,
  CommunitySource,
  UrlDefinedSource,
} = sources;

const {
  auspice,
  charon,
  errors,
  groups,
  openid,
  staticSite,
} = routing;


/* Express app setup.
 *
 * Includes authn routes:
 *   /login
 *   /logged-in
 *   /logout
 */
const app = setupApp();


/* Canary.
 */
app.use((req, res, next) => {
  if (CANARY_ORIGIN) {
    const notCanary = req.context.origin !== CANARY_ORIGIN;
    const wantsCanary = req.user?.flags?.has("canary");

    if (notCanary && wantsCanary && req.context.authnWithSession) {
      const canaryUrl = new URL(req.originalUrl, CANARY_ORIGIN);

      utils.verbose(`Redirecting ${req.user.username} to canary <${canaryUrl}>`);

      // 307 Temporary Redirect preserves request method, unlike 302 Found.
      return res.redirect(307, canaryUrl.toString());
    }
  }
  return next();
});


/* Redirects.
 */
redirects.setup(app);


/* Charon API used by Auspice.
 *
 * Routes:
 *   /charon/getAvailable
 *   /charon/getDataset
 *   /charon/getNarrative
 *   /charon/getSourceInfo
 *   /charon/*
 */
charon.setup(app);


/* Core datasets and narratives
 */
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


/* Staging datasets and narratives
 */
app.use("/staging", setSource(req => new CoreStagingSource())); // eslint-disable-line no-unused-vars

app.routeAsync("/staging")
  .getAsync(endpoints.static.sendGatsbyPage("staging/index.html"))
;

app.routeAsync("/staging/narratives")
  .getAsync((req, res) => res.redirect("/staging"));

app.routeAsync("/staging/narratives/*")
  .all(setNarrative(req => req.params[0]))
  .getAsync(getNarrative)
  .putAsync(putNarrative)
  .deleteAsync(deleteNarrative)
  .optionsAsync(optionsNarrative)
;

app.routeAsync("/staging/*")
  .all(setDataset(req => req.params[0]), canonicalizeDataset(path => `/staging/${path}`))
  .getAsync(getDataset)
  .putAsync(putDataset)
  .deleteAsync(deleteDataset)
  .optionsAsync(optionsDataset)
;


/* Community on GitHub
 */
app.use(["/community/narratives/:user/:repo", "/community/:user/:repo"],
  setSource(req => new CommunitySource(req.params.user, req.params.repo)));

/* Unlike other dataset and narrative routes, /community/:user/:repo and
 * /community/narratives/:user/:repo can go to either Auspice or Gatsby,
 * depending on the existence of a top-level dataset or narrative file.  The
 * two cases depend on the existence of a dataset file named auspice/:repo.json
 * or narrative file in narratives/:repo.md in the GitHub :user/:repo.
 *
 * If it exists, Auspice's entrypoint is sent (for HTML-accepting requests).
 *
 * If it doesn't exist, a 404 is raised and (for HTML-accepting requests)
 * Gatsby's 404 page is sent which then does client-side routing to show
 * the Gatsby page static-site/src/sections/community-repo-page.jsx.
 */
app.routeAsync(["/community/narratives/:user/:repo", "/community/narratives/:user/:repo/*"])
  .all(setNarrative(req => req.params[0]))
  .getAsync(getNarrative)
  .optionsAsync(optionsNarrative)
;

app.routeAsync(["/community/:user/:repo", "/community/:user/:repo/*"])
  .all(setDataset(req => req.params[0]))
  .getAsync(getDataset)
  .optionsAsync(optionsDataset)
;


/* Datasets and narratives at ~arbitrary remote URLs.
 */
app.use(["/fetch/narratives/:authority", "/fetch/:authority"],
  setSource(req => new UrlDefinedSource(req.params.authority)));

app.routeAsync("/fetch/narratives/:authority/*")
  .all(setNarrative(req => req.params[0]))
  .getAsync(getNarrative)
  .optionsAsync(optionsNarrative)
;

app.routeAsync("/fetch/:authority/*")
  .all(setDataset(req => req.params[0]))
  .getAsync(getDataset)
  .optionsAsync(optionsDataset)
;


/* Groups
 *
 * Routes:
 *   /groups/:groupName
 *   /groups/:groupName/settings
 *   /groups/:groupName/settings/logo
 *   /groups/:groupName/settings/overview
 *   /groups/:groupName/settings/members
 *   /groups/:groupName/settings/roles
 *   /groups/:groupName/settings/roles/:roleName/members
 *   /groups/:groupName/settings/roles/:roleName/members/:username
 *   /groups/:groupName/settings/*
 *   /groups/:groupName/narratives
 *   /groups/:groupName/narratives/*
 *   /groups/:groupName/*
 *   /whoami
 *   /users
 *   /users/:name
 */
groups.setup(app);


/* CLI convenience endpoints, e.g. downloads of release assets.
 */
app.routeAsync("/cli/download/:version/:assetSuffix")
  .getAsync(endpoints.cli.download);

app.routeAsync("/cli/download/pr-build/:prId/:assetSuffix")
  .getAsync(endpoints.cli.downloadPRBuild);

app.routeAsync("/cli/download/ci-build/:runId/:assetSuffix")
  .getAsync(endpoints.cli.downloadCIBuild);

app.routeAsync("/cli/installer/:os")
  .getAsync(endpoints.cli.installer);

app.route("/cli")
  .get((req, res) => res.redirect("https://docs.nextstrain.org/projects/cli/"));


/* JSON Schemas.
 *
 * Our schemas identity themselves using nextstrain.org URLs so that we can
 * move the actual file location around (e.g. renaming in Augur's repo or
 * moving hosting on S3) without changing the ids.  This is important as ids
 * should be ~permanent since they're consumed and used externally.  The
 * indirection will also let us present rendered, human-friendly versions of
 * the schemas to browsers/humans while still returning the JSON representation
 * to programmatic clients, though we're not this fancy yet.
 */
const schemaRoutes = [
  ["/schemas/augur/annotations",       "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-annotations.json"],
  ["/schemas/augur/frequencies",       "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-frequencies.json"],
  ["/schemas/auspice/config/v2",       "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-auspice-config-v2.json"],
  ["/schemas/dataset/v1/meta",         "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-v1-meta.json"],
  ["/schemas/dataset/v1/tree",         "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-v1-tree.json"],
  ["/schemas/dataset/v2",              "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-v2.json"],
  ["/schemas/dataset/root-sequence",   "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-export-root-sequence.json"],
  ["/schemas/dataset/tip-frequencies", "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-tip-frequencies.json"],
  ["/schemas/dataset/measurements",    "https://raw.githubusercontent.com/nextstrain/augur/HEAD/augur/data/schema-measurements.json"],
];

for (const [schemaRoute, url] of schemaRoutes) {
  app.route(schemaRoute)
    .get((req, res) => res.redirect(url));
}

app.route("/schemas/*")
  .all((req, res, next) => next(new NotFound()));


/* OpenID Connect 1.0 configuration.
 *
 * Routes:
 *   /.well-known/openid-configuration
 */
openid.setup(app);


/* Auspice.
 *
 * Routes:
 *   /dist/*
 *   /edit/narratives
 */
auspice.setup(app);


/* static-site (Gatsby).
 */
await staticSite.setup(app);


/* Error handling.
 */
errors.setup(app);


export default app;
