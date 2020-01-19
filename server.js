/* eslint no-console: off */
const path = require("path");
const sslRedirect = require('heroku-ssl-redirect');
const nakedRedirect = require('express-naked-redirect');
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const favicon = require('serve-favicon');
const compression = require('compression');
const argparse = require('argparse');
const utils = require("./auspice/server/utils");

const production = process.env.NODE_ENV === "production";

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


// Import these after parsing CLI arguments and setting global.verbose so code
// in them can use utils.verbose() at load time.
const auspiceServerHandlers = require("./auspice/server");
const authn = require("./authn");
const sources = require("./auspice/server/sources");


/* Path helpers for static assets, to make routes more readable.
 */
const relativePath = (...subpath) =>
  path.join(__dirname, ...subpath);

const gatsbyAssetPath = (...subpath) =>
  relativePath("static-site", "public", ...subpath);

const auspiceAssetPath = (...subpath) =>
  relativePath("auspice", ...subpath);


/* BASIC APP SETUP */
// NOTE: order of app.get is first come first serve (https://stackoverflow.com/questions/32603818/order-of-router-precedence-in-express-js)
const app = express();

// In production, trust Heroku as a reverse proxy and Express will use request
// metadata from the proxy.
if (production) app.enable("trust proxy");

app.set('port', process.env.PORT || 5000);
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
app.route("/auspice")
  .get((req, res) => res.redirect('https://nextstrain.github.io/auspice/'));


/* Static assets.  Auspice hardcodes /dist/… in its Webpack config.
 */
app.use(express.static(gatsbyAssetPath()));

app.route("/dist/*")
  .all(expressStaticGzip(auspiceAssetPath()));


/* Charon API used by Auspice.
 */
app.route("/charon/getAvailable")
  .get(auspiceServerHandlers.getAvailable);

app.route("/charon/getDataset")
  .get(auspiceServerHandlers.getDataset);

app.route("/charon/getNarrative")
  .get(auspiceServerHandlers.getNarrative);

app.route("/charon/getSourceInfo")
  .get(auspiceServerHandlers.getSourceInfo);

app.route("/charon/*")
  .all((req, res) => res.status(404).end());


/* Dataset and narrative paths hit Auspice's entrypoint.
 */
const coreBuilds = [
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

const groups = [...sources.keys()].filter((k) => !["core", "staging", "community"].includes(k));

const auspicePaths = [
  "/status",
  "/status/*",
  ...coreBuilds,
  ...coreBuilds.map(url => url + "/*"),
  "/narratives",
  "/narratives/*",
  "/staging",
  "/staging/*",
  ...groups.map((group) => `/groups/${group}`),
  ...groups.map((group) => `/groups/${group}/*`),

  /* Auspice gets specific /community paths so it can show an index of datasets
   * and narratives, but Gatsby gets top-level /community.
   */
  "/community/:user/:repo",
  "/community/:user/:repo/*",
];

app.route(auspicePaths).get((req, res) => {
  utils.verbose(`Sending Auspice entrypoint for ${req.originalUrl}`);
  res.sendFile(auspiceAssetPath("index.html"));
});

/* handle redirects for inrb-drc (first of the Nextstrain groups) */
app.get("/inrb-drc*", (req, res) => {
  res.redirect(`/groups${req.originalUrl}`);
});

/* Everything else hits our Gatsby app's entrypoint.
 */
app.get("*", (req, res) => {
  utils.verbose(`Sending Gatsby entrypoint for ${req.originalUrl}`);
  res.sendFile(gatsbyAssetPath("index.html"));
});


const server = app.listen(app.get('port'), () => {
  console.log("-----------------------------------");
  console.log(nextstrainAbout);
  console.log(`  Server listening on port ${server.address().port}`);
  console.log(`  Accessible at https://nextstrain.org or http://localhost:${server.address().port}`);
  console.log(`  Auspice datasets are sourced from S3 buckets.`);
  console.log("\n-----------------------------------\n\n");
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    utils.error(`Port ${app.get('port')} is currently in use by another program.
    You must either close that program or specify a different port by setting the shell variable
    "$PORT". Note that on MacOS / Linux, "lsof -n -i :${app.get('port')} | grep LISTEN" should
    identify the process currently using the port.`);
  }
  utils.error(`Uncaught error in app.listen(). Code: ${err.code}`);
});
