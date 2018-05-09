/* eslint no-console: off */
const path = require("path");
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const queryString = require("query-string");
/* auspice imports */
const charon = require("./auspice/src/server/charon");
const globals = require("./auspice/src/server/globals");

/* BASIC APP SETUP */
const app = express();
app.set('port', process.env.PORT || 5000);
app.get("/favicon.png", (req, res) => {
  res.sendFile(path.join(__dirname, "auspice", "favicon.png"));
});
// redirect www.nextstrain.org to nextstrain.org
app.use(require('express-naked-redirect')({reverse: true}));


/* GATSBY HANDLING (STATIC) */
app.use(express.static(path.join(__dirname, "nextstrain.org", "public")))


/* AUSPICE STUFF (note that only production builds are allowed -
for dev mode, go to the auspice directory and use the server there */
globals.setGlobals();
charon.applyCharonToApp(app);
app.use(expressStaticGzip(path.join(__dirname, "auspice", "dist")));
app.get(["/dist*"], (req, res) => {
  res.sendFile(path.join(__dirname, "auspice", req.originalUrl));
})
/* there must be a better way?!? */
app.get([
  "/flu*",
  "/WNV*",
  "/lassa*",
  "/zika*",
  "/ebola*",
  "/mumps*",
  "/avian*",
  "/dengue*",
  "/measels*",
  "/auspice*" /* this could be a way to access non-hardcoded datasets */
], (req, res) => {
  console.log(`Sending ${req.originalUrl} to auspice (it handles the actual route!)`)
  res.sendFile(path.join(__dirname, "auspice", "index.html"));
})

/* DEFAULT -> GATSBY SPLASH PAGE (there still needs to be a 404 page!) */
app.get("*", (req, res) => {
  console.log("hit * - sending static index")
  res.sendFile(path.join(__dirname, "nextstrain.org", "public", "index.html"));
});

const server = app.listen(app.get('port'), () => {
  console.log("-----------------------------------");
  console.log("Nextstrain.org server up on port " + server.address().port);
  console.log("Auspice JSONs sourced from S3 (dev server only available in the auspice repository)");
  console.log("Narratives & static site (splash, docs etc) served from here")
  console.log("-----------------------------------\n\n");
});
