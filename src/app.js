import * as redirects from './redirects.js';
import * as routing from "./routing/index.js";
import { setupApp } from "./routing/setup.js";
import { RESOURCE_INDEX } from './config.js';
import { updateResourceVersions } from './resourceIndex.js';

const {
  auspice,
  canary,
  charon,
  cli,
  community,
  core,
  errors,
  fetch,
  groups,
  openid,
  schemas,
  staging,
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
canary.setup(app);

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
 *
 * Routes:
 *   /dengue
 *   /ebola
 *   /enterovirus
 *   /flu
 *   /lassa
 *   /measles
 *   /mers
 *   /mumps
 *   /monkeypox
 *   /mpox
 *   /ncov
 *   /nextclade
 *   /rsv
 *   /tb
 *   /WNV
 *   /yellow-fever
 *   /zika
 *   /narratives/*
 */
core.setup(app);


/* Staging datasets and narratives
 *
 * Routes:
 *   /staging
 *   /staging/narratives
 *   /staging/narratives/*
 *   /staging/*
 */
staging.setup(app);


/* Community on GitHub
 *
 * Routes:
 *   /community/narratives/:user/:repo
 *   /community/narratives/:user/:repo/*
 *   /community/:user/:repo
 *   /community/:user/:repo/*
 */
community.setup(app);


/* Datasets and narratives at ~arbitrary remote URLs.
 *
 * Routes:
 *  /fetch/narratives/:authority/*
 *  /fetch/:authority/*
 */
fetch.setup(app);


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
 *
 * Routes:
 *   /cli/download/:version/:assetSuffix")
 *   /cli/download/pr-build/:prId/:assetSuffix")
 *   /cli/download/ci-build/:runId/:assetSuffix")
 *   /cli/installer/:os")
 *   /cli")
 */
cli.setup(app);


/* JSON Schemas.
 *
 * Routes:
 *   /schemas/augur/annotations
 *   /schemas/augur/frequencies
 *   /schemas/auspice/config/v2
 *   /schemas/dataset/v1/meta
 *   /schemas/dataset/v1/tree
 *   /schemas/dataset/v2
 *   /schemas/dataset/root-sequence
 *   /schemas/dataset/tip-frequencies
 *   /schemas/dataset/measurements
 */
schemas.setup(app);


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

/**
 * Update the resources we know about. If the index is located on S3 then we
 * check the eTag to know whether to update, and thus most calls to
 * `updateResourceVersions` simply involve a HEAD request.
 */
if (RESOURCE_INDEX) {
  updateResourceVersions();
  setInterval(updateResourceVersions, 60*60*1000)
}

export default app;
