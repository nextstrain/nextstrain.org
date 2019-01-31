const queryString = require("query-string");
const utils = require("./utils");
const helpers = require("./getDatasetHelpers");


const getDataset = async (req, res) => {
  const query = queryString.parse(req.url.split('?')[1]);
  if (!query.prefix) {
    return helpers.handleError(res, `getDataset request must define a prefix`);
  }
  const source = helpers.decideSourceFromPrefix(query.prefix);
  utils.log(`Getting (nextstrain) datasets for: ${req.url.split('?')[1]}. Source: ${source}`);

  // construct fetch URL
  let datasetInfo;
  try {
    datasetInfo = helpers.parsePrefix(source, query.prefix, query);
  } catch (err) {
    // utils.printStackTrace(err);
    return helpers.handleError(res, `Couldn't parse the url "${query.prefix}" for source "${source}"`, err.message);
  }

  /* Are we requesting a certain file type? */
  if (datasetInfo.fetchUrls.additional) {
    try {
      const jsonData = await utils.fetchJSON(datasetInfo.fetchUrls.additional);
      if (query.type === "tree") {
        return res.json({tree: jsonData});
      }
      return res.json(jsonData);
    } catch (err) {
      return helpers.handleError(res, `Couldn't fetch JSON: ${datasetInfo.fetchUrls.additional}`, err.message);
    }
  }

  /* request the main dataset (currently tree + meta) */
  try {
    const fetchMultiple = [utils.fetchJSON(datasetInfo.fetchUrls.meta), utils.fetchJSON(datasetInfo.fetchUrls.tree)];
    if (datasetInfo.fetchUrls.secondTree) {
      fetchMultiple.push(utils.fetchJSON(datasetInfo.fetchUrls.secondTree));
    }
    const data = await Promise.all(fetchMultiple);
    const jsonData = {
      meta: data[0],
      tree: data[1],
      _source: source,
      _treeName: datasetInfo.treeName,
      _url: datasetInfo.auspiceDisplayUrl
    };
    if (datasetInfo.fetchUrls.secondTree) {
      jsonData._treeTwoName = datasetInfo.secondTreeName;
      jsonData.treeTwo = data[2];
    }
    utils.verbose(`Success fetching ${fetchMultiple.length} version 1 auspice JSONs. Sending as a single JSON.`);
    res.json(jsonData);
  } catch (err) {
    return helpers.handleError(res, `Couldn't fetch JSONs`, err.message);
  }
  return undefined;
};

module.exports = {
  getDataset,
  default: getDataset
};
