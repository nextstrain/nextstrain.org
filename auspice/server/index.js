require("./setAvailableDatasets"); // sets globals
const getAvailable = require("./getAvailable").default;
const getDataset = require("./getDataset").default;
const getNarrative = require("./getNarrative").default;

module.exports = {
  getAvailable,
  getDataset,
  getNarrative
};
