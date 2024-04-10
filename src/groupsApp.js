// This application hosts a minimal Groups server.

import * as routing from "./routing/index.js";
import { setupApp } from "./routing/setup.js";


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


/* OpenID Connect 1.0 configuration.
 *
 * Routes:
 *   /.well-known/openid-configuration
 */
openid.setup(app);


/* Auspice.
 *
 * Routes
 *   /dist/*
 *   /edit/narratives
 */
auspice.setup(app);


/* static-site (Next.JS).
 */
await staticSite.setup(app);


/* Error handling.
 */
errors.setup(app);


export default app;
