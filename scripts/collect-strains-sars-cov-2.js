#!/usr/bin/env node

const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const fs = require('fs');
const pLimit = require('p-limit');

const collectStrainNames = (name, json) => {
  const strains = [];
  const recurse = (node) => {
    if (node.children) {
      for (let i=0; i<node.children.length; i++) recurse(node.children[i]);
    } else {
      strains.push(node.name);
    }
  };
  try {
    recurse(json.tree);
  } catch (err) {
    console.log(`Error collecting strain names for ${name}`);
    return [];
  }
  return strains;
};

(async () => {
  const S3 = new AWS.S3();
  const BUCKET = `nextstrain-data`;
  const NEXTSTRAIN_URL_PREFIX = `https://nextstrain.org/`;
  console.log(`Collecting datasets from ${BUCKET} to link sample names -> datasets...`);
  let s3Objects;
  try {
    s3Objects = await S3.listObjectsV2({Bucket: BUCKET}).promise();
  } catch (err) {
    console.log("Error listing objects via the S3 API -- were credentials correctly set?");
    console.log(err.message);
    process.exit(0); // exit zero so the build script doesn't fail causing the site to not be deployed.
  }
  if (s3Objects.isTruncated) console.log("WARNING: S3 listing is truncated. Results will be incomplete.");
  s3Objects = s3Objects.Contents
    .filter((s3obj) => {
      if (!s3obj.Key.endsWith(".json")) return false;
      if (s3obj.Key.endsWith("_meta.json") || s3obj.Key.endsWith("_tree.json")) return false;
      if (s3obj.Key.endsWith("_frequencies.json")) return false;
      if (s3obj.Key.endsWith("_tip-frequencies.json")) return false;
      if (s3obj.Key.endsWith("_sequences.json")) return false;
      if (s3obj.Key.endsWith("_entropy.json")) return false;
      if (s3obj.Key.endsWith("_root-sequence.json")) return false;
      return true;
    })
    .filter((s3obj) => {
      return s3obj.Key.startsWith("ncov_");
    }); // .filter((_, i) => i<10);
  const limit = pLimit(5); // limit concurrent promises as this was causing memory (?) issues on Heroku
  s3Objects = await Promise.all(s3Objects.map(async (s3obj) => limit(async () => {
    const dataset = await fetch(`https://${BUCKET}.s3.amazonaws.com/${s3obj.Key}`).then((res) => res.json());
    s3obj.strains = collectStrainNames(s3obj.Key, dataset);
    console.log(s3obj.Key, s3obj.strains.length);
    return s3obj;
  })));
  s3Objects = s3Objects.sort((a, b) => b.LastModified-a.LastModified);
  const {datasets, strainMap} = s3Objects.reduce((acc, s3obj, idx) => {
    acc.datasets.push({
      lastModified: s3obj.LastModified.toISOString().split("T")[0],
      filename: s3obj.Key,
      nGenomesInDataset: s3obj.strains.length,
      url: `${NEXTSTRAIN_URL_PREFIX}${s3obj.Key.replace('.json', '').replace('_', '/')}`
    });
    s3obj.strains.forEach((name) => {
      if (acc.strainMap[name]) acc.strainMap[name].push(idx);
      else acc.strainMap[name] = [idx];
    });
    return acc;
  }, {datasets: [], strainMap: {}});
  const dateUpdated = (new Date()).toISOString().split("T")[0];
  if (!fs.existsSync("./data")) fs.mkdirSync("./data");
  fs.writeFileSync("./data/ncov-strains-to-datasets.json", JSON.stringify({datasets, strainMap, dateUpdated}, null, 0));
})();

