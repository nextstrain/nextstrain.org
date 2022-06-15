const authz = require("../../authz");
const utils = require("../../utils");
const {canonicalizePrefix, parsePrefix} = require("../../utils/prefix");
const auspice = require("auspice");
const request = require('request');
const {BadRequest, NotFound, InternalServerError} = require("http-errors");

/**
 *
 * @param {*} res
 * @param {*} datasetInfo
 * @param {*} query
 */
const requestCertainFileType = async (res, req, additional) => {
  const jsonData = await utils.fetchJSON(additional);
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
  const main = await dataset.subresource("main").url();
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
  const query = req.query;

  if (!query.prefix) throw new BadRequest("Required query parameter 'prefix' is missing");

  utils.log(`Getting (nextstrain) datasets for: ${req.url.split('?')[1]}`);

  // construct fetch URL
  let datasetInfo;
  try {
    datasetInfo = await parsePrefix(query.prefix, query);
  } catch (err) {
    throw new BadRequest(`Couldn't parse the prefix '${query.prefix}': ${err}`);
  }

  const {source, dataset, resolvedPrefix} = datasetInfo;

  /* Authorization
   *
   * This is slightly more lenient than the handlers in endpoints/sources.js
   * because here the authz check on "source" is delayed until after "dataset"
   * is constructed and possibly resolved (instead of happening immediately
   * upon source determination), but I don't think there's anything untoward
   * lurking in the gap.
   *   -trs, 5 Jan 2022
   */
  authz.assertAuthorized(req.user, authz.actions.Read, source);
  authz.assertAuthorized(req.user, authz.actions.Read, dataset);

  /* If we got a partial prefix and resolved it into a full one, redirect to
   * that.  Auspice will notice and update its displayed URL appropriately.
   */
  if (resolvedPrefix !== await canonicalizePrefix(query.prefix)) {
    // A absolute base is required but we won't use it, so use something bogus.
    const resolvedUrl = new URL(req.originalUrl, "http://x");
    resolvedUrl.searchParams.set("prefix", resolvedPrefix);

    const relativeResolvedUrl = resolvedUrl.pathname + resolvedUrl.search;

    utils.log(`Redirecting client to resolved dataset URL: ${relativeResolvedUrl}`);
    res.redirect(relativeResolvedUrl);
    return undefined;
  }

  if (query.type) {
    const url = await dataset.subresource(query.type).url();
    return requestCertainFileType(res, req, url);
  }

  try {
    /* attempt to stream the v2 dataset */
    return await streamMainV2Dataset(res, dataset);
  } catch (errV2) {
    try {
      /* attempt to fetch the meta + tree JSONs, combine, and send */
      return await sendV1Dataset(res, await dataset.subresource("meta").url(), await dataset.subresource("tree").url());
    } catch (errV1) {
      throw errV2;
    }
  }
};

module.exports = {
  getDataset,
  default: getDataset
};
