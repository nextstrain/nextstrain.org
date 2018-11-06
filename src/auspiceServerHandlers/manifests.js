const fetch = require('node-fetch');
const utils = require("../utils");

/* hardcode some paths here (!) */
const REMOTE_DATA_LIVE_BASEURL = "http://data.nextstrain.org";
const REMOTE_DATA_STAGING_BASEURL = "http://staging.nextstrain.org";

/* this function is only temporary (I hope!) */
const oldToNew = (old) => {
  const allParts = [];
  const recurse = (partsSoFar, obj) => {
    if (typeof obj === "string") {
      // done
      allParts.push(partsSoFar);
    }
    let keys = Object.keys(obj);
    if (keys.length === 1) {
      obj = obj[keys[0]]; // eslint-disable-line
      keys = Object.keys(obj); // skip level
    }
    const defaultValue = obj.default;
    if (!defaultValue) {
      return;
    }
    const orderedKeys = [defaultValue];
    keys.forEach((k) => {
      if (k !== defaultValue && k !== "default") {
        orderedKeys.push(k);
      }
    });
    orderedKeys.forEach((key) => {
      const newParts = partsSoFar.slice();
      newParts.push(key);
      recurse(newParts, obj[key]);
    });
  };

  recurse([], old.pathogen);
  return allParts;
};

/* We need to get lists of files available...
Option 1: crawl the directories (S3? local?)
Option 2: fetch pre-generated files
For option 2, we'd have to periodically update this... or have a API trigger
*/
const buildManifests = async () => {
  utils.verbose("Fetching manifests for live & staging");
  const manifests = {};
  /* LIVE */
  try {
    let data = await fetch(`${REMOTE_DATA_LIVE_BASEURL}/manifest_guest.json`)
        .then((result) => result.json());
    data = oldToNew(data);
    utils.verbose(`Successfully got manifest for "live"`);
    manifests.live = data;
  } catch (err) {
    utils.warn(`Failed to getch manifest for "live"`);
  }
  /* STAGING */
  try {
    let data = await fetch(`${REMOTE_DATA_STAGING_BASEURL}/manifest_guest.json`)
        .then((result) => result.json());
    data = oldToNew(data);
    utils.verbose(`Successfully got manifest for "staging"`);
    manifests.staging = data;
  } catch (err) {
    utils.warn(`Failed to getch manifest for "staging"`);
  }

  utils.log(`Got manifests for ${Object.keys(manifests).join(", ")}`);
  return manifests; /* will be wrapped in a promise */
};


const checkFieldsAgainstManifest = (fields, source) => {
  const manifest = global.BAD_GET_AVAILABLE_DATASETS(source);
  if (!manifest) {
    return fields;
  }

  /* is there an exact match in the manifest? */
  let exactMatch = false;
  const matchString = fields.join("--");
  manifest.forEach((n) => {
    if (matchString === n.join("--")) exactMatch = true;
  });
  if (exactMatch) return fields;

  /* is there a partial match in the manifest? If so, use the manifest to return the correct path */
  let applicable = manifest.slice(); // shallow
  fields.forEach((field, idx) => {
    applicable = applicable.filter((entry) => entry[idx] === field);
    // console.log("after idx", idx, "(", field, "), num applicable:", applicable.length);
  });
  if (applicable.length) {
    return applicable[0];
  }

  /* fallthrough: return the original query */
  return fields;
};

module.exports = {
  buildManifests,
  checkFieldsAgainstManifest
};
