const utils = require("../client/utils");
const fetch = require('node-fetch');

/* See comment at top of "setAvailableDatasets.js" */

// SET AVAILABLE NARRATIVES AS GLOBAL
global.availableNarratives = {};
try {
  (() => new Promise((resolve, reject) => {
    const parseFiles = (files) => {
      return files
        .filter((file) => file.endsWith(".md") && file!=="README.md")
        .map((file) => file.replace(".md", ""))
        .map((file) => file.split("_").join("/"))
        .map((filepath) => ({request: `narratives/${filepath}`}));
    };

    fetch("https://api.github.com/repos/nextstrain/narratives/contents")
      .then((result) => result.json())
      .then((json) => {
        const data = parseFiles(json.map((b) => b.name));
        if (!data) {
          reject(`No available narratives`);
        }
        global.availableNarratives.live = data;
      })
      .catch(() => {
        utils.warn(`Error fetching github narrative list`);
      });
  }))();
} catch (err) {
  utils.warn(err);
}
