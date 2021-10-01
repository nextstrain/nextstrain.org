const queryString = require("query-string");

const utils = require("./utils");
const helpers = require("./getDatasetHelpers");
const {NoDatasetPathError} = require("./exceptions");
const auspice = require("auspice");
const request = require('request');
const {BadRequest, NotFound, InternalServerError} = require("http-errors");

/**
 *
 * @param {*} res
 * @param {*} datasetInfo
 * @param {*} query
 */
const requestCertainFileType = async (res, req, additional, query) => {
  const jsonData = await utils.fetchJSON(additional);
  if (query.type === "tree") {
    res.json({tree: jsonData});
  }
  res.json(jsonData);
};


/**
 * Fetch dataset in v1 format (meta + tree files), converting to v2 format
 * before sending as a JSON response to client.
 * @param {Object} res express response object
 * @param {string} metaJsonUrl
 * @param {string} treeJsonUrl
 * @returns {undefined} if successfully sent dataset
 * @throws {NotFound} If either of the JSONs were not able to be fetched
 * @throws {InternalServerError} If the parsing / conversion of the JSONs (into v2 format) failed
 */
const sendV1Dataset = async (res, metaJsonUrl, treeJsonUrl) => {
  utils.verbose(`Trying to request v1 datasets at: "${metaJsonUrl}" & "${treeJsonUrl}`);
  let data, datasetJson;
  try {
    data = await Promise.all([utils.fetchJSON(metaJsonUrl), utils.fetchJSON(treeJsonUrl)]);
  } catch (err) {
    utils.warn("Failed to fetch v1 dataset JSONs");
    throw new NotFound();
  }
  try {
    datasetJson = auspice.convertFromV1({tree: data[1], meta: data[0]});
  } catch (err) {
    utils.warn("Failed to convert v1 dataset JSONs to v2");
    throw new InternalServerError();
  }
  utils.verbose(`Success fetching & converting v1 auspice JSONs. Sending as a single v2 JSON.`);
  return res.send(datasetJson);
};

/**
 * Attempt to stream the main (v2) auspice dataset. This function (when `await`ed)
 * will finish streaming before returning.
 * @param {Object} res express response object
 * @param {Object} dataset
 * @returns {undefined} Returns undefined if streaming was successful
 * @throws {NotFound} Throws if the dataset didn't exist (or the streaming failed)
 */
const streamMainV2Dataset = async (res, dataset) => {
  const main = await dataset.urlFor("main");
  try {
    await new Promise((resolve, reject) => {
      let statusCode;
      const req = request
        .get(main)
        .on('error', (err) => reject(err))
        .on("response", (response) => {
          statusCode = response.statusCode;
          if (statusCode === 200) {
            utils.verbose(`Successfully streaming ${main}.`);
            req.pipe(res);
          }
        })
        .on("end", () => {
          if (statusCode===200) {
            return resolve();
          }
          return reject(new NotFound());
        });
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Uses custom logic to match a "best guess" dataset from the client's *req* to
 * a dataset stored on nextstrain.org.
 *
 * If the request URL differs from the URL of the matched dataset, then it sends
 * the client a redirect to the new URL.
 *
 * If the URLs match, then it sends the client the requested dataset as a JSON
 * object.
 *
 * @param {Request} req
 * @param {Response} res
 */
const getDataset = async (req, res) => {
  const query = queryString.parse(req.url.split('?')[1]);

  if (!query.prefix) throw new BadRequest("Required query parameter 'prefix' is missing");

  /*
   * "inrb-drc" was the first of the Nextstrain groups. Groups now live at
   * `nextstrain.org/groups`, but we want to support old URLs for INRB DRC by
   * redirecting requests from "/inrb-drc" to "/groups/inrb-drc".
   */
  if (query.prefix.startsWith('/inrb-drc')) {
    return res.redirect("getDataset?prefix=/groups" + query.prefix);
  }

  utils.log(`Getting (nextstrain) datasets for: ${req.url.split('?')[1]}`);

  // construct fetch URL
  let datasetInfo;
  try {
    datasetInfo = await helpers.parsePrefix(query.prefix, query);
  } catch (err) {
    /* Return a 204 No Content when Auspice makes a dataset request to a
     * valid source root without a dataset path.
     *
     * Note that this leaks the existence of private sources, but I think
     * broader discussions are leaning towards that anyhow.
     */
    if (err instanceof NoDatasetPathError) {
      utils.verbose(err.message);
      return res.status(204).end();
    }
    throw new BadRequest(`Couldn't parse the prefix '${query.prefix}': ${err}`);
  }

  const {source, dataset, resolvedPrefix} = datasetInfo;

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return utils.unauthorized(req);
  }

  /* If we got a partial prefix and resolved it into a full one, redirect to
   * that.  Auspice will notice and update its displayed URL appropriately.
   */
  if (resolvedPrefix !== await helpers.canonicalizePrefix(query.prefix)) {
    // A absolute base is required but we won't use it, so use something bogus.
    const resolvedUrl = new URL(req.originalUrl, "http://x");
    resolvedUrl.searchParams.set("prefix", resolvedPrefix);

    const relativeResolvedUrl = resolvedUrl.pathname + resolvedUrl.search;

    utils.log(`Redirecting client to resolved dataset URL: ${relativeResolvedUrl}`);
    res.redirect(relativeResolvedUrl);
    return undefined;
  }

  if (query.type) {
    const url = await dataset.urlFor(query.type);
    return requestCertainFileType(res, req, url, query);
  }

  try {
    /* attempt to stream the v2 dataset */
    return await streamMainV2Dataset(res, dataset);
  } catch (errV2) {
    try {
      /* attempt to fetch the meta + tree JSONs, combine, and send */
      return await sendV1Dataset(res, await dataset.urlFor("meta"), await dataset.urlFor("tree"));
    } catch (errV1) {
      if (dataset.isRequestValidWithoutDataset) {
        utils.verbose("Request is valid, but no dataset available. Returning 204.");
        return res.status(204).send();
      }
      throw errV2;
    }
  }
};

module.exports = {
  getDataset,
  default: getDataset
};
