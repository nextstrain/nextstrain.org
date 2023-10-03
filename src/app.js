import sslRedirect from 'heroku-ssl-redirect';

import nakedRedirect from 'express-naked-redirect';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import stream from 'stream';
import { promisify } from 'util';

/* XXX TODO: Replace promisify() with require("stream/promises") once we
 * upgrade to Node 15+.
 *   -trs, 5 Nov 2021
 */
const streamFinished = promisify(stream.finished);

const CANARY_ORIGIN = process.env.CANARY_ORIGIN;

import { PRODUCTION, RESOURCE_INDEX } from './config.js';
import * as utils from './utils/index.js';
import { addAsync } from './async.js';
import { Forbidden, NotFound, Unauthorized } from './httpErrors.js';
import * as authn from './authn/index.js';
import * as endpoints from './endpoints/index.js';
import { AuthzDenied } from './exceptions.js';
import { replacer as jsonReplacer } from './json.js';
import * as middleware from './middleware.js';
import * as redirects from './redirects.js';
import * as sources from './sources/index.js';
import { uri } from './templateLiterals.js';
import { updateResourceVersions } from './resourceIndex.js';

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
  optionsGroup,
  getGroupLogo,
  putGroupLogo,
  deleteGroupLogo,
  getGroupOverview,
  putGroupOverview,
  deleteGroupOverview,
} = endpoints.groups;

const {
  CoreSource,
  CoreStagingSource,
  CommunitySource,
  UrlDefinedSource,
  GroupSource,
} = sources;

const jsonMediaType = type => type.match(/^application\/(.+\+)?json$/);


/* Express boilerplate.
 */
const app = addAsync(express());

app.set("json replacer", jsonReplacer);

app.locals.production = PRODUCTION;
app.locals.gatsbyDevUrl = PRODUCTION ? null : process.env.GATSBY_DEV_URL;

// In production, trust Heroku as a reverse proxy and Express will use request
// metadata from the proxy.
if (PRODUCTION) app.enable("trust proxy");

app.use(sslRedirect()); // redirect HTTP to HTTPS
app.use(compression()); // send files (e.g. res.json()) using compression (if possible)
app.use(nakedRedirect({reverse: true})); // redirect www.nextstrain.org to nextstrain.org
app.use(middleware.rejectParentTraversals);


/* Setup a request-scoped context object for passing arbitrary request-local
 * data between route and param middleware and route handlers.  Akin to
 * app.locals or res.locals.
 */
app.use((req, res, next) => {
  req.context = {};

  // Set the app's origin centrally so other handlers can use it
  //
  // We can trust the HTTP Host header (req.hostname) because we're always
  // running behind name-based virtual hosting on Heroku.  A forged Host header
  // will be rejected by Heroku and never make it to us.
  req.context.origin = PRODUCTION
    ? `${req.protocol}://${req.hostname}`
    : `${req.protocol}://${req.hostname}:${req.app.get("port")}`;

  next();
});


/* Authentication (authn) setup.
 *
 * Routes:
 *   GET /login
 *   GET /logged-in
 *   GET /logout
 */
authn.setup(app);


/* CORS.
 *
 * After authn so it doesn't apply to those routes.
 */
app.use(middleware.allowPublicReadOnlyCors);


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
 */
if (!PRODUCTION) {
  // allow cross-origin from the gatsby dev server
  app.use("/charon", cors({origin: 'http://localhost:8000'}));
}

app.routeAsync("/charon/getAvailable")
  .getAsync(endpoints.charon.getAvailable);

app.routeAsync("/charon/getDataset")
  .getAsync(
    endpoints.charon.setSourceFromPrefix,
    endpoints.charon.setDatasetFromPrefix,
    endpoints.charon.canonicalizeDatasetPrefix,
    endpoints.charon.getDataset);

app.routeAsync("/charon/getNarrative")
  .getAsync(
    endpoints.charon.setSourceFromPrefix,
    endpoints.charon.setNarrativeFromPrefix,
    endpoints.charon.getNarrative);

app.routeAsync("/charon/getSourceInfo")
  .getAsync(
    endpoints.charon.setSourceFromPrefix,
    endpoints.charon.getSourceInfo);

app.routeAsync("/charon/*")
  .all((req) => {
    utils.warn(`(${req.method}) ${req.url} has not been handled / has no handler`);
    throw new NotFound();
  });


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
  `${path}@*`, // version (date) descriptors for a top-level core build
]);

app.use([coreBuildRoutes, "/narratives/*"], setSource(req => new CoreSource())); // eslint-disable-line no-unused-vars

app.routeAsync(coreBuildRoutes)
  .all(setDataset(req => req.path, true), canonicalizeDataset(path => `/${path}`))
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
 */

app.use("/groups/:groupName",
  setSource(req => new GroupSource(req.params.groupName)),

  // Canonicalize the Group name.
  (req, res, next) => {
    const restOfUrl = req.url !== "/" ? req.url : "";

    const canonicalName = req.context.source.group.name;
    const canonicalUrl = uri`/groups/${canonicalName}` + restOfUrl;

    return req.params.groupName !== canonicalName
      ? res.redirect(canonicalUrl)
      : next();
  });

app.routeAsync("/groups/:groupName")
  /* sendGatsbyPage("groups/:groupName/index.html") should work, but it
   * renders wrong for some reason that's not clear.
   */
  .getAsync(endpoints.static.sendGatsbyEntrypoint)
;

app.use("/groups/:groupName/settings",
  endpoints.groups.setGroup(req => req.params.groupName));

app.routeAsync("/groups/:groupName/settings")
  .getAsync(endpoints.static.sendGatsbyEntrypoint);

app.routeAsync("/groups/:groupName/settings/logo")
  .getAsync(getGroupLogo)
  .putAsync(putGroupLogo)
  .deleteAsync(deleteGroupLogo)
  .optionsAsync(optionsGroup)
;

app.routeAsync("/groups/:groupName/settings/overview")
  .getAsync(getGroupOverview)
  .putAsync(putGroupOverview)
  .deleteAsync(deleteGroupOverview)
  .optionsAsync(optionsGroup)
;

app.routeAsync("/groups/:groupName/settings/members")
  .getAsync(endpoints.groups.listMembers);

app.routeAsync("/groups/:groupName/settings/roles")
  .getAsync(endpoints.groups.listRoles);

app.routeAsync("/groups/:groupName/settings/roles/:roleName/members")
  .getAsync(endpoints.groups.listRoleMembers);

app.routeAsync("/groups/:groupName/settings/roles/:roleName/members/:username")
  .getAsync(endpoints.groups.getRoleMember)
  .putAsync(endpoints.groups.putRoleMember)
  .deleteAsync(endpoints.groups.deleteRoleMember)
;

app.route("/groups/:groupName/settings/*")
  .all(() => { throw new NotFound(); });

// Avoid matching "narratives" as a dataset name.
app.routeAsync("/groups/:groupName/narratives")
  .getAsync((req, res) => res.redirect(uri`/groups/${req.params.groupName}`));

app.routeAsync("/groups/:groupName/narratives/*")
  .all(setNarrative(req => req.params[0]))
  .getAsync(getNarrative)
  .putAsync(putNarrative)
  .deleteAsync(deleteNarrative)
  .optionsAsync(optionsNarrative)
;

app.routeAsync("/groups/:groupName/*")
  .all(setDataset(req => req.params[0]))
  .getAsync(getDataset)
  .putAsync(putDataset)
  .deleteAsync(deleteDataset)
  .optionsAsync(optionsDataset)
;


/* Users
 */
app.routeAsync("/whoami")
  .getAsync(endpoints.users.getWhoami);

/* For requests for text/html, the first /whoami implementation returned bare
 * bones HTML dynamic on the logged in user.  This was later replaced by a
 * redirect to /users/:name (for a logged in session) or /users (if no one
 * logged in), which then rendered a Gatsby page.  However, the /users/:name
 * form was purely aesthetic: :name was not used for routing at all.  Instead
 * of keeping up this fiction, have /whoami render the Gatsby page directly,
 * at least until we _actually_ implement user profile pages.
 *   -trs, 4 Oct 2021
 */
app.route(["/users", "/users/:name"])
  .get((req, res) => res.redirect("/whoami"));


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


/* Auspice HTML pages and assets.
 *
 * Auspice hardcodes URL paths that start with /dist/… in its Webpack config,
 * so we must use that prefix here too.
 */
app.route("/dist/*")
  .all(endpoints.static.auspiceAssets, (req, res, next) => next(new NotFound()));

/* Auspice has a special /edit/narratives route -
 * It is not backed by a dataset, and only exists for GET requests
 */
app.routeAsync("/edit/narratives")
  .getAsync(endpoints.static.sendAuspiceEntrypoint);

/* Gatsby static HTML pages and other assets.
 *
 * Any URLs matching Gatsby's static files will be handled here, e.g.
 * static-site/public/influenza/index.html will be served for /influenza.
 *
 * When a Gatsby dev server is in use, assets are proxied from the dev server
 * instead of served straight from disk.
 */
if (app.locals.gatsbyDevUrl) {
  const {createProxyMiddleware} = await import("http-proxy-middleware");

  // WebSocket endpoint
  app.get("/socket.io/", createProxyMiddleware(app.locals.gatsbyDevUrl, { ws: true }));

  /* This is the end of the line in gatsbyDevUrl mode, as the proxy middleware
   * doesn't fallthrough on 404 and even if it did the Gatsby dev server
   * returns a 200 Ok for missing pages.
   */
  app.use(createProxyMiddleware(app.locals.gatsbyDevUrl));
} else {
  app.use(endpoints.static.gatsbyAssets);
}


/* Everything else gets 404ed.
 */
app.use((req, res, next) => next(new NotFound()));


/* Error handler
 */
app.useAsync(async (err, req, res, next) => {
  /* XXX TODO: Replace calls to Express' next() with calls to our own custom
   * finalhandler (the library Express uses) function configured with an
   * "onerror" handler that does what we want with regard to logging.
   *   -trs, 1 Oct 2021
   */
  if (res.headersSent) {
    utils.verbose("Headers already sent; using Express' default error handler");
    return next(err);
  }

  /* Read the entire request body (discarding it) if the request might have a
   * body and wasn't made with Expect: 100-continue, or if it was and we wrote
   * a 100 Continue response but then ended up here.  This ensures that the
   * request is finished being sent before we return a (error) response, which
   * some clients require (such as Heroku's routing/proxy layer and the Python
   * "requests" package, but notably not curl).
   */
  const mayHaveBody = !["GET", "HEAD", "DELETE", "OPTIONS"].includes(req.method);

  if (mayHaveBody && (!req.expectsContinue || res.wroteContinue)) {
    const reqFinished = streamFinished(req);
    req.unpipe();
    req.resume();
    await reqFinished;
  }

  res.vary("Accept");

  /* "Is this request browser-like?"  Checking for explicit inclusion of
   * "text/html" is an imperfect heuristic, but still useful enough and doesn't
   * require user-agent matching, which seems more fraught and more opaque.
   *
   * Note that we don't check req.accepts("text/html"), because that'll match
   * wildcard Accept values which are sent by ~every client.
   *   -trs, 25 Jan 2022
   */
  const isBrowserLike = req.accepts().includes("text/html");

  /* Handle our authorization denied errors differently depending on if the
   * request is authenticated or not and if the client is browser-like or not.
   *
   * The intended audience for the redirect is humans following bookmarks,
   * browser history, or other saved links, which will only ever be GET (and
   * _maybe_ HEAD).
   *
   * An additional redirect condition on navigation (vs. background request)
   * would also be nice, but I can't find any good heuristic for that.
   * The following seems ideal:
   *
   *    const isNavigation = req.headers['sec-fetch-mode'] === "navigate";
   *
   * but it is not supported by Safari (macOS or iOS).
   *   -trs, 25 Jan 2022
   */
  if (err instanceof AuthzDenied) {
    if (!req.user) {
      if (["GET", "HEAD"].includes(req.method) && isBrowserLike) {
        utils.verbose(`Redirecting anonymous user to login page from ${req.originalUrl}`);
        req.session.afterLoginReturnTo = req.originalUrl;
        return res.redirect("/login");
      }
      err = new Unauthorized(err.message);
    } else {
      err = new Forbidden(err.message);
    }
  }

  /* Browser-like clients get JSON if they explicitly ask for it (regardless of
   * priority, and including our custom +json types) and all non-browser like
   * clients get JSON.
   */
  if (req.accepts().some(jsonMediaType) || !isBrowserLike) {
    utils.verbose(`Sending ${err} error as JSON`);
    return res.status(err.status || err.statusCode || 500)
      .json({
        error: err.message || String(err),
        ...(
          !PRODUCTION
            ? {stack: err.stack}
            : {}
        ),
      })
      .end();
  }

  if (err instanceof NotFound) {
    /* A note about routing: if the current URL path (i.e. req.path) matches a
     * a page known to Gatsby (e.g. via the Gatsby page's "path" or "matchPath"
     * properties), then Gatsby will perform client-side routing to load that
     * page even though we're serving a static page (404.html) here.
     */
    return await endpoints.static.sendGatsby404(req, res);
  }

  utils.verbose(`Sending ${err} error as HTML with Express' default error handler`);
  return next(err);
});

/**
 * Update the resources we know about. If the underlying data (a JSON file on
 * S3) hasn't changed then this only involves a HEAD request so we run it on an
 * hourly interval.
 */
if (RESOURCE_INDEX!==false) {
  updateResourceVersions();
  setInterval(updateResourceVersions, 60*60*1000)
}

export default app;
