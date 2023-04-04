#!/usr/bin/env node
import argparse from 'argparse';
import fetch from 'node-fetch';
import fs from 'fs';
import pLimit from 'p-limit';
import S3 from '@aws-sdk/client-s3';

const bucket = "nextstrain-data";

const parser = new argparse.ArgumentParser({
  addHelp: true,
  description: `A tool to make the (flat-file) database of sample-name -> dataset search results`,
  epilog: `
  This is a tool to create the JSON "database" file representing the sample-name -> dataset mapping
  for certain pathogens. For instance, the SARS-CoV-2 search page is at nextstrain.org/search/sars-cov-2
  and is backed by a search/sars-cov-2.json currently hosted on the ${bucket} bucket.

  The pages are created by gatsby. The JSONs are created by this tool. This should be considered a proof-
  of-concept implementation - there is plenty of scope for improvements and automation.
  `
});
parser.addArgument('--pathogen', {action: "store", required: true, metavar: "NAME", help: "what set of datasets to scan"});
main({args: parser.parseArgs()});

// -------------------------------------------------------------------------------- //

async function main({args}) {
  let datasets, strainMap, dateUpdated, outputFilename, exclusions;
  switch (args.pathogen) {
    case "ncov": // fallthrough
    case "sars-cov-2":
      outputFilename = `search_sars-cov-2.json`;
      ({datasets, strainMap, dateUpdated} = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace(/_/g, '/')}`,
        inclusionTest: (fn) => {
          return (fn.startsWith("ncov_") && !fn.endsWith("_gisaid.json") && !fn.endsWith("_zh.json"));
        }
      }));
      exclusions = await processSarsCov2ExclusionFile();
      break;
    case "flu-seasonal": // fallthrough
    case "seasonal-flu":
      outputFilename = `search_seasonal-flu.json`;
      ({datasets, strainMap, dateUpdated} = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace(/_/g, '/')}`,
        inclusionTest: (filename) => filename.startsWith("flu_seasonal_")
      }));
      break;
    default:
      console.log("Unknown pathogen!");
      process.exit(2);
  }

  console.log("Writing data to file ", `./data/${outputFilename}`);
  if (!fs.existsSync("./data")) fs.mkdirSync("./data");
  fs.writeFileSync(`./data/${outputFilename}`, JSON.stringify({datasets, strainMap, dateUpdated, exclusions}, null, 0));

  console.log("\nSUCCESS!\nNext step: upload the JSON to the S3 bucket via the following command");
  console.log(`\t\`nextstrain remote upload s3://${bucket} ./data/${outputFilename}\``);
  console.log(`and it will be picked up by users accessing the sample search functionality within nextstrain.org`);
}


// -------------------------------------------------------------------------------- //

async function collectFromBucket({BUCKET, fileToUrl, inclusionTest}) {
  console.log(`Collecting datasets from ${BUCKET} to link sample names -> datasets...`);
  const allS3Objects = await listAllObjects({BUCKET});
  let s3Objects = allS3Objects
    .filter((s3obj) => filenameLooksLikeDataset(s3obj.Key))
    .filter((s3obj) => inclusionTest(s3obj.Key)) // eslint-disable-line semi
    // .filter((_, i) => i<2);
  const limit = pLimit(5); // limit concurrent promises as this was causing memory (?) issues on Heroku
  s3Objects = await Promise.all(s3Objects.map(async (s3obj) => limit(async () => {
    const dataset = await fetch(`https://${BUCKET}.s3.amazonaws.com/${s3obj.Key}`).then((res) => res.json());
    s3obj.strains = collectStrainNamesFromDataset(s3obj.Key, dataset);
    console.log(s3obj.Key, s3obj.strains.length);
    return s3obj;
  })));
  s3Objects = s3Objects.sort((a, b) => b.LastModified-a.LastModified);
  const {datasets, strainMap} = s3Objects.reduce((acc, s3obj, idx) => {
    acc.datasets.push({
      lastModified: s3obj.LastModified.toISOString().split("T")[0],
      filename: s3obj.Key,
      nGenomesInDataset: s3obj.strains.length,
      url: fileToUrl(s3obj.Key)
    });
    s3obj.strains.forEach((name) => {
      if (acc.strainMap[name]) acc.strainMap[name].push(idx);
      else acc.strainMap[name] = [idx];
    });
    return acc;
  }, {datasets: [], strainMap: {}});
  const dateUpdated = (new Date()).toISOString().split("T")[0];
  return {datasets, strainMap, dateUpdated};
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

function collectStrainNamesFromDataset(name, json) {
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
  if (filename.endsWith("_measurements.json")) return false;
  return true;
}

async function processSarsCov2ExclusionFile() {
  console.log(`Fetching the SARS-CoV-2 exclude-list...`);
  let exclude = await fetch("https://raw.githubusercontent.com/nextstrain/ncov/master/defaults/exclude.txt");
  exclude = await exclude.text();
  exclude = exclude.split("\n")
    .reduce(
      (state, currentLine) => {
        /* The text file has no schema for associating comments explaining why a sequence is excluded
        to the strains themselves. It's mostly obvious to humans, but hard to code.
        The approach employed here is a heuristic based on what's been added so far (~800 lines).
        A "reason" is a commented line with more than one word (so that we ignore a commented sample name)
        and this reason is associated with the next block of text that's _not_ interrupted by a new line.
        That is, a new line resets any assoication between a "reason" and subsequent sample names. */
        if (currentLine === '') {
          state.currentReason = '';
          return state;
        }
        if (currentLine.startsWith('#')) {
          const uncommented = currentLine.replace(/^#\s*/, '');
          if ((uncommented.match(/\s+/g)||[]).length>0 && !state.currentReason) {
            state.currentReason = uncommented;
          }
          // else it looks like a commented strain name, or a subsequent comment in a block -- do nothing!
          return state;
        }
        if (!currentLine.match(/\s+/g)) {
          state.excludeMap[currentLine] = state.currentReason || 'unknown reason';
          return state;
        }
        console.log("Unparsed exclude.txt line: ", currentLine);
        return state;
      },
      {excludeMap: {}, currentReason: ''}
    );
  return exclude.excludeMap;
}
