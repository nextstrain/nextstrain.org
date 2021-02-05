#!/usr/bin/env node

const argparse = require('argparse');
const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit');
const {getYaml, dumpYaml, blockDefinesBuild} = require('./build-yaml-utils');

const limit = pLimit(5); // limit concurrent promises as this was causing memory (?) issues on Heroku

function buildCanBeAugmented(block) {
  // TODO for now this excludes nextstrain core builds and outside ones that
  // are embeddded in another site (like the covseq one for quebec);
  // we should make this script work for all urls that are serving auspice datasets.
  return blockDefinesBuild(block) &&
         block.url.startsWith("https://nextstrain.org") &&
         (block.url.split("https://nextstrain.org")[1].startsWith("/community") ||
         block.url.split("https://nextstrain.org")[1].startsWith("/groups") ||
         block.url.split("https://nextstrain.org")[1].startsWith("/fetch"));
}

const bucket = "nextstrain-data";

const parser = new argparse.ArgumentParser({
  addHelp: true,
  description: `
  A tool to create the following pathogen page resources:
  1. json flat-file database of sample-name -> dataset search results
  2. yaml build catalogue file with selected dataset metadata`,
  epilog: `
  This is a tool to create data needed for pages like nextstrain.org/sars-cov-2
  which serve as a collection of resources on a given pathogen.
  
  Files output by this script containing that data currently include:
  - JSON "database" file representing the sample-name -> dataset mapping
  for certain pathogens. For instance, the SARS-CoV-2 search page is at nextstrain.org/search/sars-cov-2
  (created by gatsby) and is backed by a search/sars-cov-2.json (created by this tool)
  which is currently hosted on the ${bucket} bucket.

  - YAML "catalogue" file representing a catalogue of builds for a given
  pathogen and displayed in a dropdown list and on a world map on a corresponding
  gatsby page like nextstrain.org/sars-cov-2. This tool reads in a manually curated
  version of the YAML catalogue (e.g. static-site/content/allSARS-CoV-2Builds.yaml)
  and augments it by fetching each dataset and attaching a subset of relevant
  metadata about the dataset to the catalogue entry such as the date
  when the dataset was last updated. The augmented YAML is also hosted on the ${bucket} bucket.
  `
});
parser.addArgument('--pathogen', {action: "store", required: true, metavar: "NAME", help: "what set of datasets to scan"});
main({args: parser.parseArgs()});

// -------------------------------------------------------------------------------- //

async function main({args}) {
  let s3datasetObjects, datasets, strainMap, dateUpdated, searchOutputFilename, exclusions, buildsCatalogueFilename, augmentedBuildsList, catalogueBuildDatasetObjects;
  switch (args.pathogen) {
    case "ncov": // fallthrough
    case "sars-cov-2":
      buildsCatalogueFilename = "./static-site/content/allSARS-CoV-2Builds.yaml";
      searchOutputFilename = `search_sars-cov-2.json`;
      // Step 1. load nextstrain datasets from s3
      s3datasetObjects = await collectFromBucket({
        BUCKET: `nextstrain-data`,
        fileToUrl: (filename) => `https://nextstrain.org/${filename.replace('.json', '').replace('_', '/')}`,
        inclusionTest: (fn) => {
          return (fn.startsWith("ncov_") && !fn.endsWith("_gisaid.json") && !fn.endsWith("_zh.json"));
        }
      });
      // Step 2. augment build catalogue with dataset metadata (and get catalogue datasets for searchable strainmap)
      ({augmentedBuildsList, catalogueBuildDatasetObjects} = await augmentBuildCatalogue(buildsCatalogueFilename));
      // Step 3. create search results from s3 datasets and catalogue builds
      ({datasets, strainMap, dateUpdated} = getStrainMap([...s3datasetObjects, ...catalogueBuildDatasetObjects]));
      // Step 4. process exclusion of sars cov 2 seqs from search
      exclusions = await processSarsCov2ExclusionFile();
      break;
    case "flu-seasonal": // fallthrough
    case "seasonal-flu":
      searchOutputFilename = `search_seasonal-flu.json`;
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

  const outputs = [];
  if (!fs.existsSync("./data")) fs.mkdirSync("./data");
  if (searchOutputFilename && strainMap) {
    searchOutputFilename = path.join("./data/", searchOutputFilename);
    outputs.push(searchOutputFilename);
    console.log("Writing search data to file ", `${searchOutputFilename}`);
    fs.writeFileSync(searchOutputFilename, JSON.stringify({datasets, strainMap, dateUpdated, exclusions}, null, 0));
  }
  if (buildsCatalogueFilename && augmentedBuildsList) {
    const augmentedCatalogueFilename = path.join(
      "./data/",
      path.basename(buildsCatalogueFilename).replace(".yaml", ".augmented.yaml")
    );
    outputs.push(augmentedCatalogueFilename);
    console.log("Writing augmented build catalogue yaml ", augmentedCatalogueFilename);
    dumpYaml({builds: augmentedBuildsList}, augmentedCatalogueFilename);
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
  const sortedDatasetObjects = datasetObjects.sort((a, b) => b.lastModified-a.lastModified);
  const {datasets, strainMap} = sortedDatasetObjects.reduce((acc, obj, idx) => {
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

async function augmentBuildCatalogue(buildsCatalogueFilename) {
  const catalogueBuildsYaml = getYaml(buildsCatalogueFilename);
  const catalogueBuilds = catalogueBuildsYaml.filter(buildCanBeAugmented);
  // get datasets for each build to be used in augmenting the build
  // catalogue as well as adding to the strainmap
  const catalogueBuildDatasetObjects = await Promise.all(
    catalogueBuilds.map(async (build) => limit(async () => {
      const dataset = await fetchDatasetFromCharon(build.url);
      return {
        build,
        strains: collectStrainNamesFromDataset(build.url, dataset),
        dataset,
        // surface these properties for getStrainMap
        filename: build.url.split("/").slice(4).join('_') + '.json',
        url: build.url,
        lastModified: dataset.meta.updated
      };
    })));
  // augment the catalogue builds list with metadata (where possible)
  const augmentedBuildEntries = catalogueBuildDatasetObjects.map(augmentedBuildEntry);
  const unchangedBuildEntries = catalogueBuildsYaml.filter((b) => !buildCanBeAugmented(b));
  return {
    augmentedBuildsList: [...unchangedBuildEntries, ...augmentedBuildEntries],
    catalogueBuildDatasetObjects
  };
}

function getDatasetMetaProperties(dataset) {
  return {updated: dataset.meta.updated};
}

function augmentedBuildEntry({build, dataset}) {
  try {
    return Object.assign({}, build, getDatasetMetaProperties(dataset));
  } catch (err) {
    console.error(`Error parsing metadata for dataset ${build.url}. Skipping adding metadata for this build.`);
    console.log(err.message);
    return build;
  }
}

function fetchDatasetFromCharon(url) {
  const datasetPath = url.split("https://nextstrain.org")[1].split("?")[0];
  return fetch(`https://nextstrain.org/charon/getDataset?prefix=${datasetPath}`).then((res) => res.json()).catch((err) => {
    console.error(`Error fetching dataset ${url}. Skipping adding metadata for this build.`);
    console.log(err.message);
    return {};
  });
}
