const fetch = require('node-fetch');
const queryString = require("query-string");
const utils = require("../client/utils");
const helpers = require("./getDatasetHelpers");
const parseNarrative = require('./parseNarrative').default;

const getNarrativeURL = function getNarrativeURL(prefix) {
  let filename = prefix
  .replace(/.+narratives\//, "")  // remove the URL up to (& including) "narratives/"
  .replace(/^\//, "")             // remove beginning slash
  .replace(/\/$/, "")             // remove ending slash
  .replace(/\//g, "_");           // change slashes to underscores
  if (!prefix.includes("community")) {
    return `https://raw.githubusercontent.com/nextstrain/narratives/master/${filename}.md`;
  }
  const parts = filename.split("_");
  const [orgName, repoName] = [parts[0], parts[1]];
  filename = [repoName].concat(parts.slice(2)).join("_");
  const fetchURL = `https://raw.githubusercontent.com/${orgName}/${repoName}/master/narratives/${filename}.md`;
  return fetchURL;
};

const getNarrative = async (req, res) => {
  let prefix;
  try {
    prefix = queryString.parse(req.url.split("?")[1]).prefix;
  } catch (err) {
    return helpers.handleError(res, "No prefix in narrative URL query");
  }
  const fetchURL = getNarrativeURL(prefix);

  utils.log(`trying to fetch & parse narrative file: ${fetchURL}`);
  try {
    let fileContents = await fetch(fetchURL);
    fileContents = await fileContents.text();
    const blocks = parseNarrative(fileContents);
    res.send(JSON.stringify(blocks).replace(/</g, '\\u003c'));
    utils.verbose("SUCCESS");
  } catch (err) {
    return helpers.handleError(res, `Narratives couldn't be served -- ${err.message}`);
  }
};

module.exports = {
  default: getNarrative
};
