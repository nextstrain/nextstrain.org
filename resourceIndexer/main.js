
import { ArgumentParser } from 'argparse';
import fs from 'fs';
import { coreS3Data, stagingS3Data } from "./coreStagingS3.js";
import zlib from 'zlib';
import { promisify } from 'util';
import { ResourceIndexerError } from './errors.js';

const gzip = promisify(zlib.gzip)

/**
 * We define a number of collections which each represent some listing of
 * nextstrain resources. The actual details are deferred to the provided
 * collection objects - e.g. they may represent a GitHub repo listing, an S3
 * inventory. Each of these collections provides functions which allow items
 * (files) across collections to be collected into a master list of resources
 * using three identifiers: source, resourceType and resourcePath. The intention
 * is for source to parallel the information in the corresponding Source
 * (sub-)class and resourcePath to parallel the information in the Resource
 * (sub-)class.
 *
 * Currently only sources {core, staging} and resource types {dataset,
 * intermediate} are part of the index.
 *
 * As an example, the core WNV/NA (nextstrain.org/WNV/NA) dataset is indexed
 * like so:
 *
 *    core → dataset → WNV/NA → versions -> [
 *        {date: "2021-04-08", fileUrls: {main: ...}},
 *        {date: "2019-08-30", fileUrls: {meta: ..., tree: ...}}
 *    ]
 *
 */
const COLLECTIONS = [
  coreS3Data,
  stagingS3Data,
];

function parseArgs() {
  const argparser = new ArgumentParser({
    description: `
      Fetch file lists from a number of provided collections (e.g. S3 inventories) and collect them into
      resources. Resources are organised in a hierarchical fashion via source → resourceType → resourcePath.
      Each resource contains a list of available versions, where applicable.
      The output JSON is intended for consumption by the nextstrain.org server.
      For more verbose logging set a 'DEBUG=nextstrain:*' env variable.
    `,
  });
  argparser.addArgument("--local", {action: 'storeTrue',
    help: 'Access a local copy of S3 inventories within ./devData/. See docstring of fetchInventoryLocal() for expected filenames.'})
  argparser.addArgument("--collections", {metavar: "<name>", type: "string", nargs: '+', choices: COLLECTIONS.map((c) => c.name),
    help: "Only fetch data from a subset of collections. Source names are those defined in COLLECTIONS"});
  argparser.addArgument("--resourceTypes", {metavar: "<name>", type: "string", nargs: '+', choices: ['dataset', 'intermediate'],
    help: "Only index data matching specified resource types"});
  argparser.addArgument("--save-inventories", {action: 'storeTrue',
    help: "Save the fetched inventories + manifest files to ./devData so that future invocations can use --local"});
  argparser.addArgument("--output", {metavar: "<json>", required: true})
  argparser.addArgument("--indent", {action: 'storeTrue', help: 'Indent the output JSON'})
  argparser.addArgument("--gzip", {action: 'storeTrue', help: 'GZip the output JSON'})

  return argparser.parseArgs();
}


main(parseArgs())
  .catch((err) => {
    console.error(err.message);
    if (!(err instanceof ResourceIndexerError)) {
      console.trace(err);
    }
    process.exitCode = 2;
  })


async function main(args) {

  if (args.local && args.save_inventories) {
    throw new ResourceIndexerError('Arguments --local and --save-inventories cannot be used together.')
  }

  const resources = {};
  const restrictResourceTypes = args.resourceTypes ? new Set(args.resourceTypes) : false;

  for (const collection of COLLECTIONS) {
    if (args.collections && !args.collections.includes(collection.name)) {
      continue
    }

    const groupedObjects = (await collection.collect({local: args.local, save: args.save_inventories}))
      .map(collection.categorise)
      .filter((item) => !!item)
      .filter((item) => restrictResourceTypes ? restrictResourceTypes.has(item.resourceType) : true)
      // Collect together all items ("files") based on their assigned resourceType & resourcePath
      .reduce((store, item) => {
        const {resourceType, resourcePath, source} = item;
        if (!store[source]) store[source]={}
        if (!store[source][resourceType]) store[source][resourceType]={}
        if (!store[source][resourceType][resourcePath]) store[source][resourceType][resourcePath]=[]
        store[source][resourceType][resourcePath].push(item);
        return store;
      }, {});

    for (const source of Object.keys(groupedObjects)) {
      for (const resourceType of Object.keys(groupedObjects[source])) {
        for (const [resourcePath, items] of Object.entries(groupedObjects[source][resourceType])) {
          const resource = collection.createResource(resourceType, resourcePath, items);
          if (resource.versions.length===0) continue;
          if (!resources[source]) resources[source]={}
          if (!resources[source][resourceType]) resources[source][resourceType]={}
          resources[source][resourceType][resourcePath] = resource;
        }
      }
    }
  }
  
  let output = JSON.stringify(resources, null, args.indent ? 2 : null);
  if (args.gzip) {
    output = await gzip(output)
  }
  fs.writeFileSync(args.output, output);
}