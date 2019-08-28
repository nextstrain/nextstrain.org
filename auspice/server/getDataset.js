const queryString = require("query-string");
const utils = require("./utils");
const helpers = require("./getDatasetHelpers");
const {NoDatasetPathError} = require("./exceptions");
const auspice = require("auspice");

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
 * Currently the main datasets are tree + meta
 *
 * @param {*} datasetInfo
 * @param {*} query
 */
const requestMainDataset = async (res, req, fetchUrls, treeName, secondTreeName, source) => {
  const fetchMultiple = [utils.fetchJSON(fetchUrls.meta),
    utils.fetchJSON(fetchUrls.tree)];

  if (fetchUrls.secondTree) {
    fetchMultiple.push(utils.fetchJSON(fetchUrls.secondTree));
  }

  const data = await Promise.all(fetchMultiple);

  const datasetJson = auspice.convertFromV1({tree: data[1], meta: data[0]});

  utils.verbose(`Success fetching v1 auspice JSONs. Sending as a single v2 JSON.`);
  res.send(datasetJson);

  if (fetchUrls.secondTree) {
    console.log("TO DO - SECOND TREE"); // TODO
    // jsonData._treeTwoName = secondTreeName;
    // jsonData.treeTwo = data[2];
  }
};

const getDataset = async (req, res) => {
  const query = queryString.parse(req.url.split('?')[1]);
  if (!query.prefix) {
    return helpers.handleError(res, `getDataset request must define a prefix`);
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
    return helpers.handleError(res, `Couldn't parse the url "${query.prefix}"`, err.message);
  }

  const {source, fetchUrls, treeName, secondTreeName} = datasetInfo;

  // Authorization
  if (!source.visibleToUser(req.user)) {
    return helpers.unauthorized(req, res);
  }

  if (fetchUrls.additional) {
    try {
      await requestCertainFileType(res, req, fetchUrls.additional, query);
    } catch (err) {
      return helpers.handleError(res, `Couldn't fetch JSON: ${fetchUrls.additional}`, err.message);
    }
  } else {
    try {
      await requestMainDataset(res, req, fetchUrls, treeName, secondTreeName, source);
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
