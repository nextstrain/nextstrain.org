/* eslint no-console: off */
const path = require("path");
const sslRedirect = require('heroku-ssl-redirect');
const nakedRedirect = require('express-naked-redirect');
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const favicon = require('serve-favicon');
const compression = require('compression');
const argparse = require('argparse');
const utils = require("./src/utils");
const auspicePaths = require('./auspicePaths');
const cors = require('cors');
const {addAsync} = require("@awaitjs/express");
const {NotFound} = require('http-errors');

const production = process.env.NODE_ENV === "production";

const version = utils.getGitHash();
const nextstrainAbout = `
  Nextstrain is an open-source project to harness the scientific and public
  health potential of pathogen genome data.

  This is the server behind nextstrain.org.
  See https://github.com/nextstrain/nextstrain.org for more.
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
const auspiceServerHandlers = require("./src/index.js");
const authn = require("./authn");
const redirects = require("./redirects");

/* Path helpers for static assets, to make routes more readable.
 */
const relativePath = (...subpath) =>
  path.join(__dirname, ...subpath);

const gatsbyAssetPath = (...subpath) =>
  relativePath("static-site", "public", ...subpath);

const auspiceAssetPath = (...subpath) =>
  relativePath("auspice-client", ...subpath);


/* BASIC APP SETUP */
// NOTE: order of app.get is first come first serve (https://stackoverflow.com/questions/32603818/order-of-router-precedence-in-express-js)
const app = addAsync(express());

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
redirects.setup(app);


/* Static assets.  Auspice hardcodes /dist/… in its Webpack config.
 */
app.use(express.static(gatsbyAssetPath()));

app.route("/dist/*")
  .all(expressStaticGzip(auspiceAssetPath(), {maxAge: '30d'}));


/* Charon API used by Auspice.
 */
app.routeAsync("/charon/getAvailable")
  .all(cors({origin: 'http://localhost:8000'})) // allow cross-origin from the gatsby dev server
  .getAsync(auspiceServerHandlers.getAvailable);

app.routeAsync("/charon/getDataset")
  .getAsync(auspiceServerHandlers.getDataset);

app.routeAsync("/charon/getNarrative")
  .getAsync(auspiceServerHandlers.getNarrative);

app.routeAsync("/charon/getSourceInfo")
  .getAsync(auspiceServerHandlers.getSourceInfo);

app.routeAsync("/charon/*")
  .all((req) => {
    utils.warn(`(${req.method}) ${req.url} has not been handled / has no handler`);
    throw new NotFound();
  });

app.route(auspicePaths).get((req, res) => {
  utils.verbose(`Sending Auspice entrypoint for ${req.originalUrl}`);
  res.sendFile(auspiceAssetPath("dist", "index.html"), {headers: {"Cache-Control": "no-cache, no-store, must-revalidate"}});
});

/* Everything else hits our Gatsby app's entrypoint.
 */
app.get("*", (req, res) => {
  utils.verbose(`Sending Gatsby entrypoint for ${req.originalUrl}`);
  res.sendFile(gatsbyAssetPath(""), {}, (err) => {
    // This error callback is used to display the 404 page
    if (err.code === 'EISDIR') res.status(404).sendFile(gatsbyAssetPath("404.html"));
  });
});


const server = app.listen(app.get('port'), () => {
  console.log("  -------------------------------------------------------------------------");
  console.log(nextstrainAbout);
  console.log(`  Server listening on port ${server.address().port}`);
  console.log(`  Accessible at https://nextstrain.org or http://localhost:${server.address().port}`);
  console.log(`  Server is running in ${production ? 'production' : 'development'} mode`);
  console.log("\n  -------------------------------------------------------------------------\n\n");
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    utils.error(`Port ${app.get('port')} is currently in use by another program.
    You must either close that program or specify a different port by setting the shell variable
    "$PORT". Note that on MacOS / Linux, "lsof -n -i :${app.get('port')} | grep LISTEN" should
    identify the process currently using the port.`);
  }
  utils.error(`Uncaught error in app.listen(). Code: ${err.code}`);
});
