#!/usr/bin/env node
import fs from 'fs';

import yaml from 'js-yaml';
import argparse from 'argparse';

const parser = new argparse.ArgumentParser({
  addHelp: true,
  description: `A tool to perform basic sanity checking on the YAML file behind SARS-CoV-2 datasets`
});
parser.addArgument('--precision', {action: "store", defaultValue: 0.1, type: Number, metavar: "NAME", help: "minimum (decimal degree) lat/long separation of points"});
main(parser.parseArgs());


function main(args) {
  const blocks = getYaml();
  ensureBlocksAreValid(blocks);
  ensureGeoParentsDefined(blocks);
  const datasets = blocks.filter((block) => blockDefinesBuild(block));
  compareLatLongOverlaps(datasets, args.precision);
  summarise(blocks, datasets);
}


function getYaml() {
  let SARSCoV2Datasets;
  const datasetsFilename = "./static-site/content/SARS-CoV-2-Datasets.yaml";
  try {
    SARSCoV2Datasets = yaml.load(fs.readFileSync(datasetsFilename, 'utf8'));
  } catch (e) {
    console.log(`There was an error reading ${datasetsFilename}. Please ensure it exists and it is valid YAML.`);
    console.log(e);
    process.exit(2);
  }
  if (!SARSCoV2Datasets.datasets) {
    console.log(`The datasets YAML was missing a top-level entry for "datasets".`);
    process.exit(2);
  }
  return SARSCoV2Datasets.datasets;
}

function blockDefinesBuild(block) {
  return block.geo && block.name && block.url && block.coords;
}

function ensureGeoParentsDefined(blocks) {
  const geosWithGeoParents = blocks.filter((block) => Object.prototype.hasOwnProperty.call(block, "parentGeo")).map((block) => block.geo);
  blocks.filter((block) => blockDefinesBuild(block)).forEach((block) => {
    if (!geosWithGeoParents.includes(block.geo)) {
      console.log(`Build for ${block.name} with geo "${block.geo}" doesn't have a corresponding block linking to a "parentGeo"`);
    }
  });
}

function ensureBlocksAreValid(blocks) {
  blocks.forEach((block) => {
    if (!block.geo || !block.name) {
      console.log("Invalid block:", block);
    }
    if (block.coords) {
      if (
        !Array.isArray(block.coords)
        || block.coords.length!==2
        || !(block.coords[0] >= -180 && block.coords[0] <= 180)
        || !(block.coords[1] >= -90  && block.coords[1] <= 90)
      ) {
        console.log(`Invalid coords for dataset name "${block.name}"`);
      }
    }
  });
}

/**
 * Here we treat the world as a 2-d flat surface for simplicity and ensure that the straight-line distance
 * between 2 points is greater than the supplied `precision`. Units are decimal degrees.
 */
function compareLatLongOverlaps(datasets, precision) {
  const p2 = precision**2;
  for (let i=0; i<datasets.length-1; i++) {
    const ll1 = datasets[i].coords;
    for (let j=i+1; j<datasets.length; j++) {
      const ll2 = datasets[j].coords;
      const sld2 = Math.abs(ll1[0]-ll2[0])**2 + Math.abs(ll1[1]-ll2[1])**2;
      if (sld2 < p2) {
        console.log(`Lat-longs for datasets "${datasets[i].name}" & "${datasets[j].name}" are too close`);
      }
    }
  }
}

function summarise(blocks, datasets) {
  console.log(`${blocks.length} blocks in YAML, defining ${datasets.length} datasets`);
}
