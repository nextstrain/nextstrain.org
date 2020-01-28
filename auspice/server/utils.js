const fs = require('fs');
const chalk = require('chalk');
const fetch = require('node-fetch');

const getGitHash = () => {
  /* https://stackoverflow.com/questions/34518389/get-hash-of-most-recent-git-commit-in-node */
  try {
    const rev = fs.readFileSync('.git/HEAD').toString();
    if (rev.indexOf(':') === -1) {
      return rev;
    }
    return fs.readFileSync('.git/').toString() + rev.substring(5).replace(/\n/, '');
  } catch (err) {
    return "unknown";
  }
};

const verbose = (msg, ...rest) => {
  if (global.verbose) {
    console.log(chalk.greenBright(`[verbose]\t${msg}`), ...rest);
  }
};
const log = (msg, ...rest) => {
  console.log(chalk.blueBright(msg), ...rest);
};
const warn = (msg, ...rest) => {
  console.warn(chalk.redBright(`[warning]\t${msg}`), ...rest);
};
const error = (msg, ...rest) => {
  console.error(chalk.redBright(`[error]\t${msg}`), ...rest);
  process.exit(2);
};

const fetchJSON = (pathToFetch) => {
  verbose(`Fetching ${pathToFetch}`);
  const p = fetch(pathToFetch)
    .then((res) => {
      if (res.status !== 200) throw new Error(res.statusText);
      try {
        const header = res.headers[Object.getOwnPropertySymbols(res.headers)[0]] || res.headers._headers;
        verbose(`Got type ${header["content-type"]} with encoding ${header["content-encoding"] || "none"}`);
      } catch (e) {
        // potential errors here are inconsequential for the response
      }
      return res;
    })
    .then((res) => res.json());
  return p;
};

const printStackTrace = (err) => {
  if (err.stack) {
    warn('Stacktrace:');
    console.log('====================');
    console.log(err.stack);
    console.log('====================');
  } else {
    warn("No available stacktrace");
  }
};

/**
 * Given a list of files, return a list of URL pathnames of
 * datasets which can be fetched
 * @param {Array} files. Array of strings.
 * @returns {Array}
 */
const getDatasetsFromListOfFilenames = (filenames) => {
  /* Please see https://github.com/nextstrain/nextstrain.org/pull/65 for comments
  which indicate that this function "weirdly mixes a functional, stream-based
  approach with a procedural approach" and is a candidate for refactoring.
                                                            James // Jan 2020 */

  const jsonFiles = filenames
    .filter((file) => file.endsWith(".json"));

  // All JSON files which aren't a sidecar file with a known suffix are assumed to
  // be v2+ JSONs (aka "unified" JSONs)
  const sidecarSuffixes = ["meta", "tree", "root-sequence", "seq", "tip-frequencies"];
  const datasets = jsonFiles
    .filter((filename) => !sidecarSuffixes.some((suffix) => filename.endsWith(`_${suffix}.json`)))
    .map((filename) => filename.replace(/[.]json$/, ""));

  // All *_meta.json files which have a corresponding *_tree.json are assumed to
  // be v1 JSONs.
  jsonFiles
    .filter((filename) => filename.endsWith("_meta.json"))
    .filter((filename) => jsonFiles.includes(filename.replace(/_meta[.]json$/, "_tree.json")))
    .map((filename) => filename.replace(/_meta[.]json$/, ""))
    .filter((filename) => !datasets.includes(filename))
    .forEach((filename) => datasets.push(filename));

  // modify the filenames to represent URL pathnames not filenames
  return datasets.map((filename) => filename
    .split("_")
    .join("/"));
};


module.exports = {
  getGitHash,
  verbose,
  log,
  warn,
  error,
  fetchJSON,
  printStackTrace,
  getDatasetsFromListOfFilenames
};
