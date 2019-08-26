const queryString = require("query-string");
const utils = require("./utils");
const helpers = require("./getDatasetHelpers");

const constructFetchUrl = (res, source, query) => {
  let datasetInfo;
  try {
    datasetInfo = helpers.parsePrefix(source, query.prefix, query);
  } catch (err) {
    // utils.printStackTrace(err);
    return helpers.handleError(res, `Couldn't parse the url "${query.prefix}" for source "${source}"`, err.message);
  }
  return datasetInfo;
};

/**
 *
 * @param {*} res
 * @param {*} datasetInfo
 * @param {*} query
 */
const requestCertainFileType = async (res, req, datasetInfo, query) => {
  const jsonData = await utils.fetchJSON(datasetInfo.fetchUrls.additional);
  if (query.type === "tree") {
    res.json({tree: jsonData});
  }
  res.json(jsonData);
};

/**
 * Currently the main datasets are tree + meta
 *
 * @param {*} datasetInfo
 * @param {*} query
 */
const requestMainDataset = async (res, req, datasetInfo, source) => {
  const fetchMultiple = [utils.fetchJSON(datasetInfo.fetchUrls.meta),
    utils.fetchJSON(datasetInfo.fetchUrls.tree)];

  if (datasetInfo.fetchUrls.secondTree) {
    fetchMultiple.push(utils.fetchJSON(datasetInfo.fetchUrls.secondTree));
  }

  const data = await Promise.all(fetchMultiple);

  const jsonData = {
    meta: data[0],
    tree: data[1],
    _source: source,
    _treeName: datasetInfo.treeName
  };

  if (datasetInfo.fetchUrls.secondTree) {
    jsonData._treeTwoName = datasetInfo.secondTreeName;
    jsonData.treeTwo = data[2];
  }

  utils.verbose(`Success fetching ${fetchMultiple.length} version 1 auspice JSONs. Sending as a single JSON.`);
  res.send(jsonData);
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
  if (!query.prefix) {
    return helpers.handleError(res, `getDataset request must define a prefix`);
  }

  const source = helpers.decideSourceFromPrefix(query.prefix);
  const datasetInfo = constructFetchUrl(res, source, query);

  const baseUrl = req.url.split(query.prefix)[0];
  let redirectUrl = baseUrl + '/' + datasetInfo.auspiceDisplayUrl;
  if (query.type) {
    redirectUrl += `&type=${query.type}`;
  }

  if (redirectUrl !== req.url) {
    utils.log(`Redirecting client to: ${redirectUrl}`);
    res.redirect(redirectUrl);
    return undefined;
  }
  utils.log(`Getting (nextstrain) datasets for: ${req.url.split('?')[1]}. Source: ${source}`);

  if (datasetInfo.fetchUrls.additional) {
    try {
      await requestCertainFileType(res, req, datasetInfo, query);
    } catch (err) {
      return helpers.handleError(res, `Couldn't fetch JSON: ${datasetInfo.fetchUrls.additional}`, err.message);
    }
  } else {
    try {
      await requestMainDataset(res, req, datasetInfo, source);
    } catch (err) {
      return helpers.handleError(res, `Couldn't fetch JSONs`, err.message);
    }
  }
  return undefined;
};

module.exports = {
  getDataset,
  default: getDataset
};
