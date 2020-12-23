const queryString = require("query-string");
const assert = require('assert').strict;

const utils = require("./utils");
const helpers = require("./getDatasetHelpers");
const {ResourceNotFoundError, NoDatasetPathError} = require("./exceptions");
const auspice = require("auspice");
const request = require('request');

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
 * Fetch dataset in v1 format (meta + tree files).
 * Returns a array of [success {bool}, dataToSend or response code to return]
 */
const requestV1Dataset = async (metaJsonUrl, treeJsonUrl) => {
  utils.verbose(`Trying to request v1 datasets at: "${metaJsonUrl}" & "${treeJsonUrl}`);
  let data, datasetJson;
  try {
    data = await Promise.all([utils.fetchJSON(metaJsonUrl), utils.fetchJSON(treeJsonUrl)]);
  } catch (err) {
    utils.warn("Failed to fetch v1 dataset JSONs");
    return [false, 404]; // Not Found
  }
  try {
    datasetJson = auspice.convertFromV1({tree: data[1], meta: data[0]});
  } catch (err) {
    utils.warn("Failed to convert v1 dataset JSONs to v2");
    return [false, 500]; // Internal Server Error
  }
  utils.verbose(`Success fetching & converting v1 auspice JSONs. Sending as a single v2 JSON.`);
  return [true, datasetJson];
};

/**
 * Returns a promise which will fetch the main dataset.
 * The "main" dataset is assumed to be a v2+ (unified) JSON
 * If this request 404s, then we attempt to fetch a v1-version
 * of the dataset (i.e. meta + tree JSONs) and convert it
 * to v2 format for the response.
 * Successful dataset fetches will resolve.
 * If neither the v1 nor the v2 dataset fetch / parse is successful,
 * then the promise will reject.
 */
const requestMainDataset = async (res, dataset) => {
  const main = dataset.urlFor("main");

  return new Promise((resolve, reject) => {
    /* try to stream the (v2+) dataset JSON as the response */
    const req = request
      .get(main)
      .on('error', (err) => reject(err))
      .on("response", async (response) => { // eslint-disable-line consistent-return
        if (response.statusCode === 200) {
          utils.verbose(`Successfully streaming ${main}.`);
          req.pipe(res);
          return resolve();
        }
        utils.verbose(`The request for ${main} returned ${response.statusCode}.`);

        const meta = dataset.urlFor("meta");
        const tree = dataset.urlFor("tree");
        const [success, dataToReturn] = await requestV1Dataset(meta, tree);
        if (success) {
          res.send(dataToReturn);
          return resolve();
        }
        /* Check for a 404 status code after we've had the opportunity to do a
        follow-up request for a V1 dataset. */
        if (response.statusCode === 404) reject(new ResourceNotFoundError());
        return reject(dataToReturn);
      });
  });
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
  try {
    assert(query.prefix);
  } catch {
    return res.status(400).send('getDataset request must define a prefix');
  }

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
    datasetInfo = helpers.parsePrefix(query.prefix, query);
    utils.verbose("Dataset: ", datasetInfo);
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
    return res.status(400).send(`Couldn't parse the url "${query.prefix}"`);
  }

  const {source, dataset, resolvedPrefix} = datasetInfo;

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return helpers.unauthorized(req, res);
  }

  const baseUrl = req.url.split(query.prefix)[0];
  let redirectUrl = baseUrl + '/' + resolvedPrefix;
  if (query.type) {
    redirectUrl += `&type=${query.type}`;
  }

  if (redirectUrl !== req.url) {
    utils.log(`Redirecting client to: ${redirectUrl}`);
    res.redirect(redirectUrl);
    return undefined;
  }

  if (query.type) {
    const url = dataset.urlFor(query.type);
    try {
      await requestCertainFileType(res, req, url, query);
    } catch (err) {
      if (err instanceof ResourceNotFoundError) {
        return res.status(404).send("The requested dataset does not exist.");
      }
      return helpers.handle500Error(res, `Couldn't fetch JSON: ${url}`, err.message);
    }
  } else {
    try {
      await requestMainDataset(res, dataset);
    } catch (err) {
      if (dataset.isRequestValidWithoutDataset) {
        utils.verbose("Request is valid, but no dataset available. Returning 204.");
        return res.status(204).end();
      }

      if (err instanceof ResourceNotFoundError) {
        return res.status(404).send("The requested URL does not exist.");
      }

      return helpers.handle500Error(res, `Couldn't fetch JSONs`, err.message);
    }
  }
  return undefined;
};

module.exports = {
  getDataset,
  default: getDataset
};
