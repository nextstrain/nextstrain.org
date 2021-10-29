/* eslint no-console: off */
const path = require("path");
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
const authn = require("./authn");
const redirects = require("./redirects");

/* Path helpers for static assets, to make routes more readable.
 */
const relativePath = (...subpath) =>
  path.join(__dirname, "..", ...subpath);

const gatsbyAssetPath = (...subpath) =>
  relativePath("static-site", "public", ...subpath);

const auspiceAssetPath = (...subpath) =>
  relativePath("auspice-client", ...subpath);


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
app.use(favicon(relativePath("favicon.ico")));
app.use('/favicon.png', express.static(relativePath("favicon.png")));


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

/* Specific routes to be handled by Gatsby client-side routing
 */
app.route([
  "/users/:user",
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


function sendGatsbyHandler(req, res) {
  utils.verbose(`Sending Gatsby entrypoint for ${req.originalUrl}`);
  return res.sendFile(
    gatsbyAssetPath(""),
    {},
    (err) => {
      // callback runs when the transfer is complete or when an error occurs
      if (err) res.status(404).sendFile(gatsbyAssetPath("404.html"));
    }
  );
}

function sendAuspiceHandler(req, res, next) {
  if (!req.sendToAuspice) return next(); // see previous middleware
  utils.verbose(`Sending Auspice entrypoint for ${req.originalUrl}`);
  return res.sendFile(
    auspiceAssetPath("dist", "index.html"),
    {headers: {"Cache-Control": "no-cache, no-store, must-revalidate"}}
  );
}

module.exports = app;
