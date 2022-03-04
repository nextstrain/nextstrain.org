/* See ./models.js for an explanation of the design of these classes.
 */

const {CoreSource, CoreStagingSource} = require("./core");
const {CommunitySource} = require("./community");
const {UrlDefinedSource} = require("./fetch");
const {GroupSource} = require("./groups");

module.exports = {
  CoreSource,
  CoreStagingSource,
  CommunitySource,
  UrlDefinedSource,
  GroupSource,
};
