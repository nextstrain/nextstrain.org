#!/usr/bin/env node

const argparse = require('argparse');
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const fs = require('fs');
const pLimit = require('p-limit');
const yaml = require('js-yaml');

function dumpYaml(content, path) {
  try {
    fs.writeFileSync(path, yaml.dump(content), 'utf8');
  } catch (e) {
    console.log(`There was an error writing ${path}.`);
    console.log(e);
    process.exit(2);
  }
}

// TODO duplicates function from ./check-sars-cov-2-builds-yaml.js
function getYaml(buildsFilename) {
  let allSARSCoV2Builds;
  try {
    allSARSCoV2Builds = yaml.load(fs.readFileSync(buildsFilename, 'utf8'));
  } catch (e) {
    console.log(`There was an error reading ${buildsFilename}. Please ensure it exists and it is valid YAML.`);
    console.log(e);
    process.exit(2);
  }
  if (!allSARSCoV2Builds.builds) {
    console.log(`The builds YAML was missing a top-level entry for "builds".`);
    process.exit(2);
  }
  return allSARSCoV2Builds.builds;
}

// TODO duplicates function from ./check-sars-cov-2-builds-yaml.js
function blockDefinesBuild(block) {
  return block.geo && block.name && block.url && block.coords;
}

function blockDefinesCommunityBuild(block) {
  // TODO for now this excludes ones that are embeddded in another site; is this necessary or can we request charon at those urls too?
  return blockDefinesBuild(block) &&
         block.url.startsWith("https://nextstrain.org") &&
         (block.url.split("https://nextstrain.org")[1].startsWith("/community") ||
         block.url.split("https://nextstrain.org")[1].startsWith("/groups") ||
         block.url.split("https://nextstrain.org")[1].startsWith("/fetch"));
}

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
      const buildsFilename = "./static-site/content/allSARS-CoV-2Builds.yaml";
      outputFilename = `search_sars-cov-2.json`;
      // Step 1. load nextstrain datasets from s3
      ({datasets, strainMap, dateUpdated} = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace('_', '/')}`,
        inclusionTest: (fn) => {
          return (fn.startsWith("ncov_") && !fn.endsWith("_gisaid.json") && !fn.endsWith("_zh.json"));
        }
      }));
      // Step 2. load community datasets from charon
      sarscov2BuildsYaml = getYaml(buildsFilename);
      let buildEntries = sarscov2BuildsYaml.filter(blockDefinesCommunityBuild);
      const hierarchyEntries = sarscov2BuildsYaml.filter((b) => !blockDefinesCommunityBuild(b));
      const augmentedBuildEntries = await Promise.all(buildEntries.map(augmentedBuildEntry));
      dumpYaml({builds: hierarchyEntries.concat(augmentedBuildEntries)}, buildsFilename.replace(".yaml", ".augmented.yaml"));
      // Step 3. process exclusion of sars cov 2 seqs from search
      exclusions = await processSarsCov2ExclusionFile();
      break;
    case "flu-seasonal": // fallthrough
    case "seasonal-flu":
      outputFilename = `search_seasonal-flu.json`;
      ({datasets, strainMap, dateUpdated} = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace('_', '/')}`,
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
  const S3 = new AWS.S3();
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

function getDatasetMetaProperties(dataset) {
  return {updated: dataset.meta.updated};
}

async function augmentedBuildEntry(build) {
  const dataset = await fetchCommunityBuildCharon(build);
  try {
    build.meta = getDatasetMetaProperties(dataset);
  } catch (err) {
    console.error(`Error parsing metadata for dataset ${build.url}. Skipping adding metadata for this build.`);
    build.meta = null;
  }
  return build;
}

function fetchCommunityBuildCharon(build) {
  const path = build.url.split("https://nextstrain.org")[1].split("?")[0];
  return fetch(`https://nextstrain.org/charon/getDataset?prefix=${path}`).then((res) => res.json()).catch((err) => {
    console.error(`Error fetching dataset ${build.url}. Skipping adding metadata for this build.`);
    return {};
  });
}
