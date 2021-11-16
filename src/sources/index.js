const utils = require("../utils");
const {CoreSource, CoreStagingSource} = require("./core");
const {CommunitySource} = require("./community");
const {UrlDefinedSource} = require("./fetch");
const {groupSources} = require("./groups");

const sources = [
  CoreSource,
  CoreStagingSource,
  CommunitySource,
  UrlDefinedSource,
  ...groupSources,
];

const sourceMap = new Map(sources.map(s => [s._name, s]));
utils.verbose("Sources are:", sourceMap);

module.exports = sourceMap;
