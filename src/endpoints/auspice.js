import expressStaticGzip from 'express-static-gzip';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { InternalServerError } from '../httpErrors.js';
import * as utils from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/* Path helpers for our handlers below.
 */
const assetPath = (...subpath) =>
  path.join(__dirname, "..", "..", ...subpath);

const auspiceAssetPath = (...subpath) =>
  assetPath("auspice-client", ...subpath);

/* Handlers for static assets.
 */
const auspiceAssets = expressStaticGzip(auspiceAssetPath(), {maxAge: '30d'});


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

/**
 * Send the Auspice entrypoint (index.html) to display a dataset or narrative.
 *
 * Auspice will identify the dataset or narrative to display by inspecting the
 * browser location, which will match the current request path.
 *
 * @type {asyncExpressHandler}
 */
const sendAuspiceEntrypoint = async (req, res) => {
  utils.verbose(`Sending Auspice entrypoint for ${req.originalUrl}`);
  return await sendFile(
    res,
    auspiceAssetPath("dist", "index.html"),
    {headers: {"Cache-Control": "no-cache, no-store, must-revalidate"}}
  );
};


/**
 * @callback asyncExpressHandler
 * @async
 * @param {express.request} req
 * @param {express.response} res
 */

export {
  auspiceAssets,
  sendAuspiceEntrypoint,
};
