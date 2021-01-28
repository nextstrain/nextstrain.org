#!/usr/bin/env node

/* eslint-disable no-prototype-builtins */
const argparse = require('argparse');
const {getYaml, blockDefinesBuild} = require('./build-yaml-utils');

const parser = new argparse.ArgumentParser({
  addHelp: true,
  description: `A tool to perform basic sanity checking on the YAML file behind SARS-CoV-2 builds`
});
parser.addArgument('--precision', {action: "store", defaultValue: 0.1, type: Number, metavar: "NAME", help: "minimum (decimal degree) lat/long separation of points"});
main(parser.parseArgs());


function main(args) {
  const buildsFilename = "./static-site/content/allSARS-CoV-2Builds.yaml";
  const blocks = getYaml(buildsFilename);
  ensureBlocksAreValid(blocks);
  ensureGeoParentsDefined(blocks);
  const builds = blocks.filter((block) => blockDefinesBuild(block));
  compareLatLongOverlaps(builds, args.precision);
  summarise(blocks, builds);
}

function ensureGeoParentsDefined(blocks) {
  const geosWithGeoParents = blocks.filter((block) => block.hasOwnProperty("parentGeo")).map((block) => block.geo);
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
        !Array.isArray(block.coords) || block.coords.length!==2 ||
        !(block.coords[0] >= -180 && block.coords[0] <= 180) || !(block.coords[1] >= -90 && block.coords[1] <= 90)
      ) {
        console.log(`Invalid coords for build name "${block.name}"`);
      }
    }
  });
}

/**
 * Here we treat the world as a 2-d flat surface for simplicity and ensure that the straight-line distance
 * between 2 points is greater than the supplied `precision`. Units are decimal degrees.
 */
function compareLatLongOverlaps(builds, precision) {
  const p2 = precision**2;
  for (let i=0; i<builds.length-1; i++) {
    const ll1 = builds[i].coords;
    for (let j=i+1; j<builds.length; j++) {
      const ll2 = builds[j].coords;
      const sld2 = Math.abs(ll1[0]-ll2[0])**2 + Math.abs(ll1[1]-ll2[1])**2;
      if (sld2 < p2) {
        console.log(`Lat-longs for builds "${builds[i].name}" & "${builds[j].name}" are too close`);
      }
    }
  }
}

function summarise(blocks, builds) {
  console.log(`${blocks.length} blocks in YAML, defining ${builds.length} builds`);
}
