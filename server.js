/* eslint no-console: off */
const path = require("path");
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const queryString = require("query-string");

/* auspice imports */
const getFiles = require('./auspice/src/server/util/getFiles');
// const serverReact = require('./auspice/src/server/util/sendReactComponents');
const serverNarratives = require('./auspice/src/server/util/narratives');

/* APP SETUP */
const app = express();
app.set('port', process.env.PORT || 5000);
app.get("/favicon.png", (req, res) => {
  res.sendFile(path.join(__dirname, "auspice", "favicon.png"));
});

/* GATSBY HANDLING (STATIC) */
app.use(express.static(path.join(__dirname, "nextstrain.org", "public")))
/* redirect www.nextstrain.org to nextstrain.org */
app.use(require('express-naked-redirect')({reverse: true}));


/* AUSPICE HANDLING (note that this only works for production builds!) */

/* these globals will go - just testing here */
/* parse args, set some as global to be available in utility scripts */
const devServer = process.argv.indexOf("dev") !== -1;
global.LOCAL_DATA = process.argv.indexOf("localData") !== -1;
global.LOCAL_DATA_PATH = path.join(__dirname, "auspice", "data/");
global.REMOTE_DATA_LIVE_BASEURL = "http://data.nextstrain.org/";
global.REMOTE_DATA_STAGING_BASEURL = "http://staging.nextstrain.org/";
global.LOCAL_STATIC = process.argv.indexOf("localStatic") !== -1;
global.LOCAL_STATIC_PATH = path.join(__dirname, "auspice", "static/");
global.REMOTE_STATIC_BASEURL = "http://cdn.rawgit.com/nextstrain/nextstrain.org/master/";

app.get('/charon*', (req, res) => {
  const query = queryString.parse(req.url.split('?')[1]);
  console.log("API request: " + req.originalUrl);
  if (Object.keys(query).indexOf("request") === -1) {
    console.warn("Query rejected (nothing requested) -- " + req.originalUrl);
    return; // 404
  }
  switch (query.request) {
    case "manifest": {
      getFiles.getManifest(query, res);
      break;
    } case "narrative": {
      serverNarratives.serveNarrative(query, res);
      break;
    } case "splashimage": {
      getFiles.getSplashImage(query, res);
      break;
    } case "image": {
      getFiles.getImage(query, res);
      break;
    } case "json": {
      getFiles.getDatasetJson(query, res);
      break;
    } default: {
      console.warn("Query rejected (unknown want) -- " + req.originalUrl);
    }
  }
});

app.use(expressStaticGzip(path.join(__dirname, "auspice", "dist")));
// app.use(express.static(path.join(__dirname, "auspice", "dist")));
app.get(["/zika*"], (req, res) => {
  console.log("hit zika - sending auspice index.html")
  res.sendFile(path.join(__dirname, "auspice", "index.html"));
})
app.get(["/dist*"], (req, res) => {
  console.log("hit auspice dist request to ", req.originalUrl)
  res.sendFile(path.join(__dirname, "auspice", req.originalUrl));
})


/* DEFAULT -> GATSBY SPLASH PAGE (there still needs to be a 404 page!) */
app.get("*", (req, res) => {
  console.log("hit * - sending static index")
  res.sendFile(path.join(__dirname, "nextstrain.org", "public", "index.html"));
});

const server = app.listen(app.get('port'), () => {
  console.log("-----------------------------------");
  console.log("PLAY");
  console.log("-----------------------------------\n\n");

  console.log("-----------------------------------");
  console.log("Auspice server started on port " + server.address().port);
  console.log(devServer ? "Serving dev bundle with hot-reloading enabled" : "Serving compiled bundle from /dist");
  console.log(global.LOCAL_DATA ? "Data is being sourced from /data" : "Data is being sourced from data.nextstrain.org (S3)");
  console.log(global.LOCAL_STATIC ? "Static content is being sourced from /static" : "Static content is being sourced from cdn.rawgit.com");
  console.log("-----------------------------------\n\n");
});
