#!/usr/bin/env node
const AWS = require("aws-sdk");
const limit = require('p-limit')(20);
const fs = require('fs');
const path = require('path');
const ndjsonParser = require('ndjson-parse');
const sources = require("../src/sources.js");

// this script is proof-of-principle quality
main();


async function main() {
  const datasets = [];

  const core = await collectFromBucket({
    BUCKET: `nextstrain-data`,
    fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace(/_/g, '/')}`,
    inclusionTest: () => true
  });
  core.forEach((obj) => datasets.push({
    filename: obj.filename,
    date_uploaded: obj.date_uploaded,
    url: obj.url,
    contributor: "Nextstrain",
    source: "Core"
  }));

  const staging = await collectFromBucket({
    BUCKET: `nextstrain-staging`,
    fileToUrl: (filename) => `https://nextstrain.org/staging/${filename.replace('.json', '').replace(/_/g, '/')}`,
    inclusionTest: () => true
  });
  staging.forEach((obj) => datasets.push({
    filename: obj.filename,
    date_uploaded: obj.date_uploaded,
    url: obj.url,
    contributor: "Nextstrain",
    source: "Staging"
  }));

  // PUBLIC GROUPS:
  for (const [sourceName, Source] of sources) {
    if (Source.isGroup() && Source.visibleToUser()) { // both static methods
      const source = new Source();
      const data = await collectFromBucket({ // eslint-disable-line no-await-in-loop
        BUCKET: source.bucket,
        fileToUrl: (filename) => `https://nextstrain.org/groups/${sourceName}/${filename.replace('.json', '').replace(/_/g, '/')}`,
        inclusionTest: () => true
      });
      data.forEach((obj) => datasets.push({
        filename: obj.filename,
        date_uploaded: obj.date_uploaded,
        url: obj.url,
        contributor: sourceName,
        source: `Public Group`
      }));
    }
  }

  // following assumes your directory structure is the same as mine!
  const communityNdJson = fs.readFileSync("../community-search/community.ndjson", {encoding: "utf-8"});
  const communityJson = ndjsonParser(communityNdJson);
  communityJson
    .filter((obj) => obj.valid)
    .forEach((obj) => datasets.push({
      filename: obj.url.replace("https://nextstrain.org/community/", "").replace(/\//g, '_'),
      date_uploaded: "unknown",
      url: obj.url,
      contributor: obj.repo.owner,
      source: `Community`
    }));

  // restrict to unique URLs
  const seen = new Set();
  const uniqueDatasets = datasets.filter((f) => {
    if (seen.has(f.url)) return false;
    seen.add(f.url);
    return true;
  });

  // console.log(datasets);

  if (!fs.existsSync("./data")) fs.mkdirSync("./data");
  const outputFilename = path.join("./data/", "tmp-all-datasets.json");
  console.log("Writing search data to file ", `${outputFilename}`);
  fs.writeFileSync(outputFilename, JSON.stringify(uniqueDatasets, null, 1));

  console.log("\n\nNext step: upload outputs to the S3 bucket via the following command");
  console.log(`\t\`nextstrain remote upload s3://nextstrain-staging/james/ data/tmp-all-datasets.json\``);
}


/* following duplicated from "collect-datasets.js" */
async function collectFromBucket({BUCKET, fileToUrl, inclusionTest}) {
  const S3 = new AWS.S3();
  console.log(`Collecting datasets from ${BUCKET} to retrieve metadata...`);
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
    .filter((s3obj) => filenameLooksLikeDataset(s3obj.Key))
    .filter((s3obj) => inclusionTest(s3obj.Key)) // eslint-disable-line semi
    // .filter((_, i) => i<2);
  const dataObjects = await Promise.all(s3Objects.map(async (s3obj) => limit(async () => {
    // surface these properties for getDatasetMetadata
    s3obj.filename = s3obj.Key;
    s3obj.url = fileToUrl(s3obj.Key);
    s3obj.date_uploaded = s3obj.LastModified.toISOString().split("T")[0];
    return s3obj;
  })));
  return dataObjects;
}

/* following duplicated from "collect-datasets.js" */
function filenameLooksLikeDataset(filename) {
  if (!filename.endsWith(".json")) return false;
  if (filename.endsWith("_meta.json") || filename.endsWith("_tree.json")) return false;
  if (filename.endsWith("_frequencies.json")) return false;
  if (filename.endsWith("_tip-frequencies.json")) return false;
  if (filename.endsWith("_aa-mutation-frequencies.json")) return false;
  if (filename.endsWith("_sequences.json")) return false;
  if (filename.endsWith("_entropy.json")) return false;
  if (filename.endsWith("_root-sequence.json")) return false;
  return true;
}
