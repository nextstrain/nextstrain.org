/* eslint no-console: off */
const sslRedirect = require('heroku-ssl-redirect');
const nakedRedirect = require('express-naked-redirect');
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const favicon = require('serve-favicon');
const compression = require('compression');
const utils = require("./utils");
const { potentialAuspiceRoutes, isRequestBackedByAuspiceDataset } = require('./auspicePaths');
const cors = require('cors');
const {addAsync} = require("@awaitjs/express");
const {NotFound} = require('http-errors');

const production = process.env.NODE_ENV === "production";

const charon = require("./endpoints/charon");
const users = require("./endpoints/users");
const {assetPath, auspiceAssetPath, gatsbyAssetPath, sendAuspiceHandler, sendGatsbyHandler} = require("./endpoints/static");
const authn = require("./authn");
const redirects = require("./redirects");


/* BASIC APP SETUP */
// NOTE: order of app.get is first come first serve (https://stackoverflow.com/questions/32603818/order-of-router-precedence-in-express-js)
const app = addAsync(express());

app.locals.production = production;

// In production, trust Heroku as a reverse proxy and Express will use request
// metadata from the proxy.
if (production) app.enable("trust proxy");

app.use(sslRedirect()); // redirect HTTP to HTTPS
app.use(compression()); // send files (e.g. res.json()) using compression (if possible)
app.use(nakedRedirect({reverse: true})); // redirect www.nextstrain.org to nextstrain.org
app.use(favicon(assetPath("favicon.ico")));
app.use('/favicon.png', express.static(assetPath("favicon.png")));


/* Authentication (authn)
 */
authn.setup(app);


/* Redirects.
 */
redirects.setup(app);


/* Static assets.
 * Any paths matching resources here will be handled and not fall through to our handlers below.
 * E.g. URL `/influenza` gets sent `static-site/public/influenza/index.html`
 */
app.use(express.static(gatsbyAssetPath()));
app.route("/dist/*") // Auspice hardcodes /dist/… in its Webpack config.
  .all(expressStaticGzip(auspiceAssetPath(), {maxAge: '30d'}));


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

/* Specific routes to be handled by Gatsby client-side routing
 */
app.route([
  "/groups",
  "/groups/:groupName"
]).get((req, res) => res.sendFile(gatsbyAssetPath("index.html")));

/* Routes which are plausibly for auspice, as they have specific path signatures.
 * We verify if these are are backed by datasets and hand to auspice if so.
 */
app.route(potentialAuspiceRoutes).get(
  isRequestBackedByAuspiceDataset,
  sendAuspiceHandler,
  sendGatsbyHandler
);

/**
 * Finally, we catch all remaining routes and send to Gatsby
 */
app.get("*", sendGatsbyHandler);


module.exports = app;
