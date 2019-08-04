/* eslint no-console: off */
const path = require("path");
const sslRedirect = require('heroku-ssl-redirect');
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const favicon = require('serve-favicon');
const compression = require('compression');
const argparse = require('argparse');
const utils = require("./auspice/server/utils");
const auspiceServerHandlers = require("./auspice/server");

const version = utils.getGitHash();
const nextstrainAbout = `
  Nextstrain is an open-source project to harness the scientific and public health potential
  of pathogen genome data. This is the server behind nextstrain.org.
  It delivers the static content (https://github.com/nextstrain/static) as well as the interactive 
  visualisation app auspice (https://github.com/nextstrain/auspice), with customisations.
`;
const parser = new argparse.ArgumentParser({
  version,
  addHelp: true,
  description: `Nextstrain.org server version ${version}`,
  epilog: nextstrainAbout
});
parser.addArgument('--verbose', {action: "storeTrue", help: "verbose server logging"});
const args = parser.parseArgs();
global.verbose = args.verbose;


/* BASIC APP SETUP */
// NOTE: order of app.get is first come first serve (https://stackoverflow.com/questions/32603818/order-of-router-precedence-in-express-js)
const app = express();
app.set('port', process.env.PORT || 5000);
app.use(favicon(path.join(__dirname, "favicon.png")));
app.use('/favicon.png', express.static(path.join(__dirname, "favicon.png")));
app.use(sslRedirect()); // redirect HTTP to HTTPS
app.use(compression()); // send files (e.g. res.json()) using compression (if possible)
app.use(require('express-naked-redirect')({reverse: true})); // redirect www.nextstrain.org to nextstrain.org

/* simple logging for debugging */
// app.use((req, res, next) => {console.log("LOG REQUEST  ", req.originalUrl); next();});

/* A portion of nextstrain.org is a "static" website build with gatsby
 * This is ./static-site, with it's own package.json etc
 * ./static-site/public contains the built files we need serve
 */
app.use(express.static(path.join(__dirname, "static-site", "public")));
const gatsbyRoutes = [
  "/",
  "/about*",
  "/blog*",
  "/docs*",
  "/reports*",
  "/tutorial*",
  "/community",
  "/local*" // local shouldn't be handled by auspice for nextstrain.org
];
app.get(gatsbyRoutes, (req, res) => {
  utils.verbose(`Sending ${req.originalUrl} to gatsby as it matches a (hardcoded) gatsby route`);
  res.sendFile(path.join(__dirname, "static-site", "public", "index.html"));
});


/* We use auspice to display phylogenomic data.
 * Our version of auspice is based off of https://github.com/nextstrain/auspice
 * but is built with custom extensions -- see "./src/auspiceConfig.json"
 * The built code is available in the "./auspice" directory.
 * Note that if you are developing auspice in the context of nextstrain.org, it's
 * easier to do this by using the auspice dev server. See docs.
 */

/* Handle the auspice-derived requests ("charon") */
app.get("/charon/getAvailable", auspiceServerHandlers.getAvailable);
app.get("/charon/getDataset", auspiceServerHandlers.getDataset);
app.get("/charon/getNarrative", auspiceServerHandlers.getNarrative);
app.get("/charon*", (req, res) => {
  res.statusMessage = `Query unhandled: ${req.originalUrl}`;
  utils.warn(res.statusMessage);
  return res.status(500).end();
});

/* Any remaining paths go to auspice */
app.use(expressStaticGzip(path.join(__dirname, "auspice", "dist")));
app.get(["/dist*"], (req, res) => {
  res.sendFile(path.join(__dirname, "auspice", req.originalUrl));
});
app.get("*", (req, res) => {
  utils.verbose(`Sending ${req.originalUrl} to auspice (it handles the actual route!)`);
  res.sendFile(path.join(__dirname, "auspice", "index.html"));
});


const server = app.listen(app.get('port'), () => {
  console.log("-----------------------------------");
  console.log(nextstrainAbout);
  console.log(`  Server listening on port ${server.address().port}`);
  console.log(`  Accessible at https://nextstrain.org or http://localhost:${server.address().port}`)
  console.log(`  Auspice datasets are sourced from S3 buckets.`);
  console.log("\n-----------------------------------\n\n");
});
