#!/usr/bin/env node

const argparse = require('argparse');
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const fs = require('fs');
const pLimit = require('p-limit');
const {getYaml, dumpYaml, blockDefinesBuild} = require('./build-yaml-utils');

const limit = pLimit(5); // limit concurrent promises as this was causing memory (?) issues on Heroku

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
  let s3datasetObjects, datasets, strainMap, dateUpdated, buildsFilename, outputFilename, exclusions;
  switch (args.pathogen) {
    case "ncov": // fallthrough
    case "sars-cov-2":
      buildsFilename = "./static-site/content/allSARS-CoV-2Builds.yaml";
      outputFilename = `search_sars-cov-2.json`;
      // Step 1. load nextstrain datasets from s3
      s3datasetObjects = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace('_', '/')}`,
        inclusionTest: (fn) => {
          return (fn.startsWith("ncov_") && !fn.endsWith("_gisaid.json") && !fn.endsWith("_zh.json"));
        }
      });
      // Step 2. load community (includes /community, /groups, /fetch) datasets from charon
      // TODO move all of step 2 into a function so that it can be reused for other pathogens
      const communityBuildsYaml = getYaml(buildsFilename);
      const communityBuilds = communityBuildsYaml.filter(blockDefinesCommunityBuild);
      const communityBuildDatasetObjects = await Promise.all(
        communityBuilds.map(async(build) => limit(async () => {
          const dataset = await fetchCommunityBuildCharon(build);
          const strains = collectStrainNamesFromDataset(build.url, dataset);
          return {build, strains, dataset,
            // surface these properties for getStrainMap
            filename: build.url.split("/").slice(4).join('_') + '.json',
            url: build.url,
            lastModified: dataset.meta.updated
          };
        })
      ));
      // Step 3. augment the community builds list with metadata
      const augmentedBuildEntries = communityBuildDatasetObjects.map(augmentedBuildEntry);
      const hierarchyEntries = communityBuildsYaml.filter((b) => !blockDefinesCommunityBuild(b));
      dumpYaml({builds: [...hierarchyEntries, ...augmentedBuildEntries]}, buildsFilename.replace(".yaml", ".augmented.yaml"));
      // Step 4. create search results from s3 datasets and community builds
      ({datasets, strainMap, dateUpdated} = getStrainMap([...s3datasetObjects, ...communityBuildDatasetObjects]));
      // Step 5. process exclusion of sars cov 2 seqs from search
      exclusions = await processSarsCov2ExclusionFile();
      break;
    case "flu-seasonal": // fallthrough
    case "seasonal-flu":
      outputFilename = `search_seasonal-flu.json`;
      s3datasetObjects = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace('_', '/')}`,
        inclusionTest: (filename) => filename.startsWith("flu_seasonal_")
      });
      ({datasets, strainMap, dateUpdated} = getStrainMap(s3datasetObjects));
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
  const dataObjects = await Promise.all(s3Objects.map(async (s3obj) => limit(async () => {
    const dataset = await fetch(`https://${BUCKET}.s3.amazonaws.com/${s3obj.Key}`).then((res) => res.json());
    s3obj.strains = collectStrainNamesFromDataset(s3obj.Key, dataset);
    // surface these properties for getStrainMap
    s3obj.filename = s3obj.Key;
    s3obj.url = fileToUrl(s3obj.Key);
    s3obj.lastModified = s3obj.LastModified.toISOString().split("T")[0];
    console.log(s3obj.Key, s3obj.strains.length);
    return s3obj;
  })));
  return dataObjects;
}

function getStrainMap(datasetObjects) {
  // Sort descending AKA newest first
  datasetObjects = datasetObjects.sort((a, b) => b.lastModified-a.lastModified);
  const {datasets, strainMap} = datasetObjects.reduce((acc, obj, idx) => {
    acc.datasets.push({
      lastModified: obj.lastModified,
      filename: obj.filename,
      nGenomesInDataset: obj.strains.length,
      url: obj.url
    });
    obj.strains.forEach((name) => {
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

function augmentedBuildEntry({build, dataset}) {
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
