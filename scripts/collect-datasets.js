#!/usr/bin/env node
import argparse from 'argparse';
import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import S3 from '@aws-sdk/client-s3';

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
parser.addArgument('--keyword', {action: "store", required: true, metavar: "NAME", help: "what set of datasets to scan, ie flu"});
main({args: parser.parseArgs()});

// -------------------------------------------------------------------------------- //

async function main({args}) {
  let s3datasetObjects, datasetMetadata, outputFilename;
  switch (args.keyword) {
    case "flu":
      outputFilename = `datasets_influenza.json`;
      s3datasetObjects = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace(/_/g, '/')}`,
        inclusionTest: (filename) => filename.startsWith("flu_")
      });
      datasetMetadata = getDatasetMetadata(s3datasetObjects);
      break;
    case "staging":
      outputFilename = `datasets_staging.json`;
      s3datasetObjects = await collectFromBucket({
        BUCKET: `nextstrain-staging`,
        fileToUrl: (filename) => `https://nextstrain.org/staging/${filename.replace('.json', '').replace(/_/g, '/')}`,
        inclusionTest: (filename) => true // eslint-disable-line
      });
      datasetMetadata = getDatasetMetadata(s3datasetObjects);
      break;
    default:
      console.log("Unknown keyword!");
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
  console.log(`Collecting datasets from ${BUCKET} to retrieve metadata...`);
  const allS3Objects = await listAllObjects({BUCKET});
  const s3Objects = allS3Objects
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

async function listAllObjects({BUCKET}) {
  const client = new S3.S3Client();
  const s3Objects = [];

  try {
    for await (const page of S3.paginateListObjectsV2({client}, {Bucket: BUCKET})) {
      s3Objects.push(...page.Contents);
    }
  } catch (err) {
    console.log("Error listing objects via the S3 API -- were credentials correctly set?");
    console.log(err.message);
    process.exit(0); // exit zero so the build script doesn't fail causing the site to not be deployed.
  }

  return s3Objects;
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
  if (filename.endsWith("_titers.json")) return false;
  if (filename.endsWith("_tip-frequencies.json")) return false;
  if (filename.endsWith("_aa-mutation-frequencies.json")) return false;
  if (filename.endsWith("_sequences.json")) return false;
  if (filename.endsWith("_entropy.json")) return false;
  if (filename.endsWith("_root-sequence.json")) return false;
  if (filename.endsWith("_measurements.json")) return false;
  if (filename.includes("manifest")) return false;
  if (filename === ("datasets_staging.json")) return false;
  // The line below is due to the fact that
  // S3 objects (files) in folders cannot be accessed by Auspice
  // so we ingore them here as we collect datasets which will
  // be turned into Auspice URLs.
  if (filename.includes("/")) return false;
  return true;
}
