require("./setAvailableDatasets"); // sets globals
require("./setAvailableNarratives"); // sets globals
const getAvailable = require("./getAvailable").default;
const getDataset = require("./getDataset").default;
const getNarrative = require("./getNarrative").default;

module.exports = {
  getAvailable,
  getDataset,
  getNarrative
};
