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
const log = (msg) => {
  console.log(chalk.blueBright(msg));
};
const warn = (msg) => {
  console.warn(chalk.redBright(`[warning]\t${msg}`));
};

const fetchJSON = (path) => {
  const p = fetch(path)
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

module.exports = {
  getGitHash,
  verbose,
  log,
  warn,
  fetchJSON,
  printStackTrace
};
