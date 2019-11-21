require("./setAvailableDatasets"); // sets globals
const getAvailable = require("./getAvailable").default;
const getDataset = require("./getDataset").default;
const getNarrative = require("./getNarrative").default;
const getSourceInfo = require("./getSourceInfo").default;

module.exports = {
  getAvailable,
  getDataset,
  getNarrative,
  getSourceInfo
};
