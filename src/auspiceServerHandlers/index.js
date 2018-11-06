const getAvailable = require("./getAvailable").default;
const getDataset = require("./getDataset").default;
const utils = require("../utils");

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
