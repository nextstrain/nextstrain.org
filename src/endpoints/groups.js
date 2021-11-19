const getSourceInfoFromPath = require("./charon/getSourceInfo").fromPath;
const {contentTypesProvided} = require("../negotiate");
const {sendGatsbyEntrypoint} = require("./static");


const getGroup = contentTypesProvided([
  /* sendGatsbyPage("groups/:groupName/index.html") should work, but it
   * renders wrong for some reason that's not clear.
   */
  ["html", sendGatsbyEntrypoint],
  ["json", getSourceInfoFromPath], // XXX FIXME
]);


module.exports = {
  getGroup,
};
