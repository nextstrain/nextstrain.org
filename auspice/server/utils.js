const fs = require('fs');
const chalk = require('chalk');
const fetch = require('node-fetch');
const childProcess = require('child_process');
const path = require('path');

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
const log = (msg) => {
  console.log(chalk.blueBright(msg));
};
const warn = (msg) => {
  console.warn(chalk.redBright(`[warning]\t${msg}`));
};
const error = (msg) => {
  console.error(chalk.redBright(`[error]\t${msg}`));
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


/** Since npm doesn't search globally installed npm packages
 * we can't simply require("auspice"). This is important as we
 * encourage global installs of auspice, and a local install of
 * auspice is problematic -- see https://github.com/nextstrain/auspice/issues/689
 *
 * This function will import auspice locally if it exists else
 * it'll use the globally installed auspice.
 * Throws if it can't find an instance of auspice installed.
 */
const importAuspice = () => {
  if (fs.existsSync("../node_modules/auspice")) {
    return require("auspice"); // eslint-disable-line
  }
  const globalNpmAuspiceDir = path.join(
    childProcess.execSync('npm root --global').toString().trim(),
    "auspice"
  );
  if (fs.existsSync(globalNpmAuspiceDir)) {
    return require(globalNpmAuspiceDir); // eslint-disable-line
  }
  throw new Error("Cannot find an auspice installation -- auspice must be installed globally (e.g. 'npm install --global auspice') or locally (e.g. 'npm install auspice').");
};

module.exports = {
  getGitHash,
  verbose,
  log,
  warn,
  error,
  fetchJSON,
  printStackTrace,
  importAuspice
};
