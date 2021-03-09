#!/usr/bin/env node
const argparse = require('argparse');
const AWS = require("aws-sdk");
const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit');

const limit = pLimit(5); // limit concurrent promises as this was causing memory (?) issues on Heroku

const bucket = "nextstrain-data";

const parser = new argparse.ArgumentParser({
  addHelp: true,
  description: `
  A tool to create the dataset resources scraped from S3 buckets, resulting
  in a JSON build catalogue file with selected dataset metadata`,
  epilog: `
  This is a tool to create data needed for pages like nextstrain.org/influenza,
  nextstrain.org/datasets, etc...
  which serve as a filterable collection of datasets.

  - JSON "catalogue" file representing a catalogue of datasets. This tool reads
  in an S3 bucket and fetchesss each dataset in this bucket and outputs a set of
  metadata for each dataset such as title, maintainers, etc.. The JSON output is
  also hosted on the ${bucket} bucket.
  `
});
parser.addArgument('--pathogen', {action: "store", required: true, metavar: "NAME", help: "what set of datasets to scan, ie flu"});
main({args: parser.parseArgs()});

// -------------------------------------------------------------------------------- //

async function main({args}) {
  let s3datasetObjects, datasetMetadata, outputFilename;
  switch (args.pathogen) {
    case "flu":
      outputFilename = `datasets_influenza.json`;
      s3datasetObjects = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace(/_/g, '/')}`,
        inclusionTest: (filename) => filename.startsWith("flu_")
      });
      datasetMetadata = getDatasetMetadata(s3datasetObjects);
      break;
    default:
      console.log("Unknown pathogen!");
      process.exit(2);
  }

  const outputs = [];
  if (!fs.existsSync("./data")) fs.mkdirSync("./data");
  if (outputFilename) {
    outputFilename = path.join("./data/", outputFilename);
    outputs.push(outputFilename);
    console.log("Writing search data to file ", `${outputFilename}`);
    fs.writeFileSync(outputFilename, JSON.stringify(datasetMetadata, null, 1));
  }
  if (outputs.length >= 1) {
    console.log("\nSUCCESS!\nNext step: upload outputs to the S3 bucket via the following command");
    console.log(`\t\`nextstrain remote upload s3://${bucket} ${outputs.join('  ')}\``);
    console.log(`so they can be accessed by nextstrain.org`);
  } else {
    // this shouldn't happen but just in case it does, it's better than nothing
    console.log("Something went wrong - not writing outputs.");
  }
}


// -------------------------------------------------------------------------------- //

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
    s3obj.contributor = "Nextstrain";
    console.log(s3obj.Key);
    return s3obj;
  })));
  return dataObjects;
}

function getDatasetMetadata(datasetObjects) {
  const datasetMetadata = datasetObjects.map((obj) => {
    const entry = {
      date_uploaded: obj.date_uploaded,
      filename: obj.filename,
      url: obj.url,
      contributor: obj.contributor
    };
    return entry;
  });
  console.log(datasetMetadata);
  return datasetMetadata;
}

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
