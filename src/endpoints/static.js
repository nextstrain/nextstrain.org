const path = require("path");

const utils = require("../utils");


/* Path helpers for static assets, to make routes more readable.
 */
const assetPath = (...subpath) =>
  path.join(__dirname, "..", "..", ...subpath);

const auspiceAssetPath = (...subpath) =>
  assetPath("auspice-client", ...subpath);

const gatsbyAssetPath = (...subpath) =>
  assetPath("static-site", "public", ...subpath);


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
  if (!req.sendToAuspice) return next(); // see isRequestBackedByAuspiceDataset middleware
  utils.verbose(`Sending Auspice entrypoint for ${req.originalUrl}`);
  return res.sendFile(
    auspiceAssetPath("dist", "index.html"),
    {headers: {"Cache-Control": "no-cache, no-store, must-revalidate"}}
  );
}


module.exports = {
  assetPath,
  auspiceAssetPath,
  gatsbyAssetPath,

  sendAuspiceHandler,
  sendGatsbyHandler,
};
