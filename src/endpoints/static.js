const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const {InternalServerError} = require("http-errors");
const path = require("path");

const utils = require("../utils");


/* Path helpers for our handlers below.
 */
const assetPath = (...subpath) =>
  path.join(__dirname, "..", "..", ...subpath);

const auspiceAssetPath = (...subpath) =>
  assetPath("auspice-client", ...subpath);

const gatsbyAssetPath = (...subpath) =>
  assetPath("static-site", "public", ...subpath);


/* Handlers for static assets.
 */
const auspiceAssets = expressStaticGzip(auspiceAssetPath(), {maxAge: '30d'});

const gatsbyAssets = express.static(gatsbyAssetPath());


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
 * Generate Express handler that sends the specified Gatsby page.
 *
 * Note that Gatsby may perform client-side routing if the browser location
 * (i.e. the current request path) doesn't match the page served (i.e. the
 * page's `path` and/or `matchPath` configuration).
 *
 * If the application is in `gatsbyDevUrl` mode, pages are transparently
 * sourced from the configured `gatsby develop` server instead of the
 * filesystem.
 *
 * @param {String} page - Path to a Gatsby page's rendered static HTML file
 * @returns {asyncExpressHandler}
 */
const sendGatsbyPage = (page) => async (req, res) => {
  if (req.app.locals.gatsbyDevUrl) {
    const pageUrl = (new URL(page, req.app.locals.gatsbyDevUrl)).toString();

    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const proxy = require("http-proxy").createProxyServer({
      target: pageUrl,
      ignorePath: true, // ignore req.path since pageUrl is fully specified
    });

    utils.verbose(`Sending Gatsby page ${pageUrl} for ${req.originalUrl}`);

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-shadow
      proxy.on("end", (req, res) => {
        res.end();
        resolve();
      });
      proxy.web(req, res, (err) => reject(err));
    });
  }

  utils.verbose(`Sending Gatsby page ${page} for ${req.originalUrl}`);
  return await sendFile(res, gatsbyAssetPath(page));
};


/**
 * Send the Gatsby entrypoint (index.html).
 *
 * Gatsby will likely perform client-side routing based on the browser
 * location.
 *
 * @type {asyncExpressHandler}
 */
const sendGatsbyEntrypoint = sendGatsbyPage("index.html");


/**
 * Send the Gatsby 404 page.
 *
 * Note that Gatsby may perform client-side routing if the browser location
 * (i.e. the current request path) doesn't match the page served (i.e. the
 * page's `path` and/or `matchPath` configuration).
 *
 * @type {asyncExpressHandler}
 */
const sendGatsby404 = async (req, res) => {
  /* When app.locals.gatsbyDevUrl is in use, the following 404 status is
   * overwritten with the upstream response status (usually 200).  Not a big
   * deal during development, but a difference worth noting.  Fixable if
   * needed, but kinda annoying to do so.
   *   -trs, 28 Oct 2021
   */
  res.status(404);
  return await sendGatsbyPage("404.html")(req, res);
};


/**
 * @callback asyncExpressHandler
 * @async
 * @param {express.request} req
 * @param {express.response} res
 */


module.exports = {
  auspiceAssets,
  gatsbyAssets,

  sendFile,
  sendAuspiceEntrypoint,
  sendGatsbyPage,
  sendGatsbyEntrypoint,
  sendGatsby404,
};
