const {InternalServerError} = require("http-errors");
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


/**
 * Send the file at the given `filePath` as the response.
 *
 * Uses `res.sendFile()` and accepts the same `options` object, but presents an
 * async interface instead of a callback interface.
 *
 * Unlike `res.sendFile()`, the response is automatically finalized with
 * `res.end()` once the file is successfully sent.  This avoids the default
 * behaviour of continuing on to the `next()` handler, which very rarely is
 * desired when sending a static file.
 *
 * Returns a Promise which resolves without any value on a successful transfer
 * or rejects with an `InternalServerError` providing detail on what went
 * wrong.
 *
 * @param {ServerResponse} res
 * @param {String} filePath
 * @param {Object} [options]
 *
 * @returns {Promise}
 */
const sendFile = async (res, filePath, options) => {
  return new Promise((resolve, reject) => {
    res.sendFile(filePath, options, (err) => {
      if (err) return reject(new InternalServerError(err));

      res.end();
      return resolve();
    });
  });
};

const sendAuspiceEntrypoint = async (req, res) => {
  utils.verbose(`Sending Auspice entrypoint for ${req.originalUrl}`);
  return await sendFile(
    res,
    auspiceAssetPath("dist", "index.html"),
    {headers: {"Cache-Control": "no-cache, no-store, must-revalidate"}}
  );
};

const sendGatsbyPage = (page) => async (req, res) => {
  utils.verbose(`Sending Gatsby page ${page} for ${req.originalUrl}`);
  return await sendFile(res, gatsbyAssetPath(page));
};

const sendGatsbyEntrypoint = sendGatsbyPage("index.html");

const sendGatsby404 = async (req, res) => {
  res.status(404);
  return await sendGatsbyPage("404.html")(req, res);
};


module.exports = {
  assetPath,
  auspiceAssetPath,
  gatsbyAssetPath,

  sendFile,
  sendAuspiceEntrypoint,
  sendGatsbyPage,
  sendGatsbyEntrypoint,
  sendGatsby404,
};
