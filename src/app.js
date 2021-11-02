/* eslint no-console: off */
const sslRedirect = require('heroku-ssl-redirect');
const nakedRedirect = require('express-naked-redirect');
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const favicon = require('serve-favicon');
const compression = require('compression');
const utils = require("./utils");
const cors = require('cors');
const {addAsync} = require("@awaitjs/express");
const {NotFound} = require('http-errors');

const production = process.env.NODE_ENV === "production";

const charon = require("./endpoints/charon");
const users = require("./endpoints/users");
const {assetPath, auspiceAssetPath, gatsbyAssetPath, sendAuspiceEntrypoint, sendGatsbyEntrypoint, sendGatsby404} = require("./endpoints/static");
const {setSource, setGroupSource, setDataset, setNarrative, canonicalizeDataset, ifDatasetExists, ifNarrativeExists} = require("./endpoints/sources");
const authn = require("./authn");
const redirects = require("./redirects");

const esc = encodeURIComponent;


/* Express boilerplate.
 */
const app = addAsync(express());

app.locals.production = production;
app.locals.gatsbyDevUrl = production ? null : process.env.GATSBY_DEV_URL;

// In production, trust Heroku as a reverse proxy and Express will use request
// metadata from the proxy.
if (production) app.enable("trust proxy");

app.use(sslRedirect()); // redirect HTTP to HTTPS
app.use(compression()); // send files (e.g. res.json()) using compression (if possible)
app.use(nakedRedirect({reverse: true})); // redirect www.nextstrain.org to nextstrain.org
app.use(favicon(assetPath("favicon.ico")));
app.use('/favicon.png', express.static(assetPath("favicon.png")));


/* Setup a request-scoped context object for passing arbitrary request-local
 * data between route and param middleware and route handlers.  Akin to
 * app.locals or res.locals.
 */
app.use((req, res, next) => {
  req.context = {};
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


/* Redirects.
 */
redirects.setup(app);


/* Charon API used by Auspice.
 */
if (!production) {
  // allow cross-origin from the gatsby dev server
  app.use("/charon", cors({origin: 'http://localhost:8000'}));
}

app.routeAsync("/charon/getAvailable")
  .getAsync(charon.getAvailable);

app.routeAsync("/charon/getDataset")
  .getAsync(charon.getDataset);

app.routeAsync("/charon/getNarrative")
  .getAsync(charon.getNarrative);

app.routeAsync("/charon/getSourceInfo")
  .getAsync(charon.getSourceInfo);

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
  "/ncov",
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

app.use([coreBuildRoutes, "/narratives/*"], setSource("core"));

app.routeAsync(coreBuildRoutes)
  .all(setDataset(req => req.path), canonicalizeDataset(path => `/${path}`))
  .getAsync(ifDatasetExists, sendAuspiceEntrypoint)
;

app.routeAsync("/narratives/*")
  .all(setNarrative(req => req.params[0]))
  .getAsync(ifNarrativeExists, sendAuspiceEntrypoint)
;


/* Staging datasets and narratives
 */
app.use("/staging", setSource("staging"));

app.routeAsync("/staging/narratives")
  .getAsync((req, res) => res.redirect("/staging"));

app.routeAsync("/staging/narratives/*")
  .all(setNarrative(req => req.params[0]))
  .getAsync(ifNarrativeExists, sendAuspiceEntrypoint)
;

app.routeAsync("/staging/*")
  .all(setDataset(req => req.params[0]), canonicalizeDataset(path => `/staging/${path}`))
  .getAsync(ifDatasetExists, sendAuspiceEntrypoint)
;


/* Community on GitHub
 */
app.use("/community/:user/:repo",
  setSource("community", req => [req.params.user, req.params.repo]));

app.routeAsync("/community/:user/:repo/narratives")
  .getAsync((req, res) => res.redirect(`/community/${esc(req.params.user)}/${esc(req.params.repo)}`));

app.routeAsync("/community/:user/:repo/narratives/*")
  .all(setNarrative(req => req.params[0]))
  .getAsync(ifNarrativeExists, sendAuspiceEntrypoint)
;

/* Unlike other dataset routes, /community/:user/:repo can go to either Auspice
 * or Gatsby, depending on the existence of a top-level dataset file.  The two
 * cases depend on the existence of a dataset file named auspice/:repo.json in
 * the GitHub :user/:repo.
 *
 * If it exists, Auspice's entrypoint is sent (for HTML-accepting requests).
 *
 * If it doesn't exist, a 404 is raised and (for HTML-accepting requests)
 * Gatsby's 404 page is sent which then does client-side routing to show
 * the Gatsby page static-site/src/sections/community-repo-page.jsx.
 */
app.routeAsync(["/community/:user/:repo", "/community/:user/:repo/*"])
  .all(setDataset(req => req.params[0]))
  .getAsync(ifDatasetExists, sendAuspiceEntrypoint)
;


/* Datasets and narratives at ~arbitrary remote URLs.
 */
app.routeAsync("/fetch/:authority/*")
  .all(setSource("fetch", req => req.params.authority), setDataset(req => req.params[0]))

  // Assume existence; little benefit to checking when we don't have a fallback page.
  .getAsync(sendAuspiceEntrypoint)
;


/* Groups
 */

/* XXX TODO: Remove setGroupSource() once we move from one source per group to
 * one source parameterized by group name, which will enable us to use the
 * standard setSource() like so:
 *
 *    app.use("/groups/:groupName", setSource("group", req => req.params.groupName))
 *
 *   -trs, 25 Oct 2021
 */
app.use("/groups/:groupName", setGroupSource(req => req.params.groupName));

app.routeAsync("/groups/:groupName")
  /* sendGatsbyPage("groups/:groupName/index.html") should work, but it
   * renders wrong for some reason that's not clear.
   */
  .getAsync(sendGatsbyEntrypoint)
;

// Avoid matching "narratives" as a dataset name.
app.routeAsync("/groups/:groupName/narratives")
  .getAsync((req, res) => res.redirect(`/groups/${esc(req.params.groupName)}`));

app.routeAsync("/groups/:groupName/narratives/*")
  .all(setNarrative(req => req.params[0]))
  .getAsync(ifNarrativeExists, sendAuspiceEntrypoint)
;

app.routeAsync("/groups/:groupName/*")
  .all(setDataset(req => req.params[0]))
  .getAsync(ifDatasetExists, sendAuspiceEntrypoint)
;


/* Users
 */
app.routeAsync("/whoami")
  .getAsync(users.getWhoami);

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


/* Auspice HTML pages and assets.
 *
 * Auspice hardcodes URL paths that start with /dist/… in its Webpack config,
 * so we must use that prefix here too.
 */
app.route("/dist/*")
  .all(expressStaticGzip(auspiceAssetPath(), {fallthrough: false, maxAge: '30d'}));


/* Gatsby static HTML pages and other assets.
 *
 * Any URLs matching Gatsby's static files will be handled here, e.g.
 * static-site/public/influenza/index.html will be served for /influenza.
 *
 * When a Gatsby dev server is in use, assets are proxied from the dev server
 * instead of served straight from disk.
 */
if (app.locals.gatsbyDevUrl) {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const {createProxyMiddleware} = require("http-proxy-middleware");

  // WebSocket endpoint
  app.get("/socket.io/", createProxyMiddleware(app.locals.gatsbyDevUrl, {ws: true}));

  /* This is the end of the line in gatsbyDevUrl mode, as the proxy middleware
   * doesn't fallthrough on 404 and even if it did the Gatsby dev server
   * returns a 200 Ok for missing pages.
   */
  app.use(createProxyMiddleware(app.locals.gatsbyDevUrl));
} else {
  app.use(express.static(gatsbyAssetPath()));
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

  if (err instanceof NotFound) {
    /* A note about routing: if the current URL path (i.e. req.path) matches a
     * a page known to Gatsby (e.g. via the Gatsby page's "path" or "matchPath"
     * properties), then Gatsby will perform client-side routing to load that
     * page even though we're serving a static page (404.html) here.
     */
    return await sendGatsby404(req, res);
  }

  utils.verbose(`Sending ${err} error as HTML with Express' default error handler`);
  return next(err);
});


module.exports = app;
