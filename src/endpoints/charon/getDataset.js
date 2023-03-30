import { NotFound, InternalServerError } from '../../httpErrors.js';
import * as utils from '../../utils/index.js';
import * as datasetConverters from '../../utils/datasetConverters.js';
import { sendDatasetSubresource } from '../sources.js';

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
    datasetJson = datasetConverters.convertFromV1({tree: data[1], meta: data[0]});
  } catch (err) {
    utils.warn("Failed to convert v1 dataset JSONs to v2");
    throw new InternalServerError();
  }
  utils.verbose(`Success fetching & converting v1 auspice JSONs. Sending as a single v2 JSON.`);
  return res.send(datasetJson);
};

const getDataset = async (req, res) => {
  const type = req.query.type ?? "main";

  utils.log(`Getting (nextstrain) datasets for: ${req.url.split('?')[1]}`);

  try {
    /* attempt to stream the v2 (main) dataset or sidecar */
    return await sendDatasetSubresource(type)(req, res);
  } catch (errV2) {
    utils.warn(`Failed to fetch v2 ${type} JSON: ${errV2}`);
    if (type === "main" && errV2 instanceof NotFound) {
      try {
        /* attempt to fetch the v1 (meta + tree) dataset JSONs, combine, and send */
        return await sendV1Dataset(res, await req.context.dataset.subresource("meta").url(), await req.context.dataset.subresource("tree").url());
      } catch (errV1) {
        throw errV2;
      }
    }
    throw errV2;
  }
};

export {
  getDataset,
};
