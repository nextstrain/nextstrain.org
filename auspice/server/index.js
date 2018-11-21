require("./setAvailableDatasets"); // sets globals
require("./setAvailableNarratives"); // sets globals
const getAvailable = require("./getAvailable").default;
const getDataset = require("./getDataset").default;
const utils = require("../client/utils");

const getNarrative = (req, res) => {
  res.statusMessage = `Nextstrain.org currently doesn't serve narratives.`;
  utils.warn(res.statusMessage);
  return res.status(500).end();
};

module.exports = {
  getAvailable,
  getDataset,
  getNarrative
};
