import * as fs from 'node:fs/promises';
import neatCsv from 'neat-csv';
import zlib from 'zlib';
import { promisify } from 'util';
import AWS from 'aws-sdk';
import * as utils from '../utils/index.js';

const gunzip = promisify(zlib.gunzip)

/**
 * Fetches and reads the latest inventory from the provided bucket/prefix via:
 *    - finds the most recent manifest.json via comparison of timestamps in keys
 *    - uses this manifest.json to get the schema + key of the actual inventory
 *    - gets the actual inventory & returns the data as an object[] with keys from the schema
 * 
 * Note that we only read a maximum of 999 keys from the provided bucket+prefix. A typical inventory
 * update adds ~4 keys, so this should allow for ~8 months of inventories. The bucket where inventories
 * are stored should use lifecycles to expire objects.
 * 
 * If `process.env.LOCAL_INVENTORY` is set then we instead read the following files:
 *    - `./devData/${name}.manifest.json`
 *    - `./devData/${name}.inventory.csv.gz`
 * 
 * @returns {object[]} list of entries in the inventory, using the schema to define keys
 */
const fetchInventory = async ({bucket, prefix, name}) => {

  if (process.env.LOCAL_INVENTORY) {
    const manifestPath = `./devData/${name}.manifest.json`;
    const inventoryPath = `./devData/${name}.inventory.csv.gz`;
    utils.verbose(`inventory for ${name} -- reading S3 inventories from ${manifestPath} and ${inventoryPath}`);
    const manifestHandle = fs.open(manifestPath, 'r');
    const manifest = JSON.parse(
      await manifestHandle.then((handle) => handle.readFile())
    )
    manifestHandle.then((handle) => handle.close()) // P.S. close() is a promise
    const schema = _parseManifest(manifest).schema;
    const inventoryHandle = fs.open(inventoryPath, 'r');
    const inventory = await inventoryHandle
        .then((handle) => handle.readFile())
        .then((buffer) => gunzip(buffer))
        .then((data) => neatCsv(data, schema))
    inventoryHandle.then((handle) => handle.close()) // P.S. close() is a promise
    utils.verbose(`inventory for ${name} - read ${inventory.length} rows from the local file`)
    return inventory;
  }

  const S3 = new AWS.S3();
  const manifestKey = await new Promise((resolve, reject) => {
    S3.listObjectsV2({Bucket: bucket, Prefix: prefix, MaxKeys: 999}, (err, data) => {
      if (err) reject(err);
      const orderedKeys = data.Contents
        .map((object) => object.Key)
        .filter((key) => key.endsWith('/manifest.json'))
        .sort()     // keys are identical except for a YYYY-MM-DDTHH-MMZ timestamp within the key itself
        .reverse(); // now sorted most recent object first
      if (orderedKeys.length===0) reject("No valid inventory manifest.json found")
      resolve(orderedKeys[0])
    });
  });
  utils.verbose(`inventory for ${name} - manifest key: ${manifestKey}`)

  const {schema, inventoryKey} = await new Promise((resolve, reject) => {
    S3.getObject({Bucket: bucket, Key: manifestKey}, (err, data) => {
      if (err) reject(err);
      /* NOTE - the Body property of the response is a Buffer in S3 SDK v2 (which we use)
         but this has changed to a readable stream in SDK v3 */
      resolve(_parseManifest(JSON.parse(data.Body.toString('utf-8'))));
    })
  });
  utils.verbose(`inventory for ${name} - parsed manifest JSON`)

  const inventory = await (new Promise((resolve, reject) => {
    S3.getObject({Bucket: bucket, Key: inventoryKey}, (err, data) => {
      if (err) reject(err);
      resolve(data.Body);
    })
  })).then((buffer) => gunzip(buffer))
    .then((data) => neatCsv(data, schema));

  utils.verbose(`inventory for ${name} - fetched ${inventory.length} rows`)
  return inventory;
}

/**
 * Returns a list of objects in the requested S3 inventory, which itself represents a list of
 * objects + versions within a specific bucket+prefix. Minimal filtering is performed to remove
 * delete markers and to change the last modified timestamp into a datestamp
 * @returns {object[]}
 */
const parseInventory = async ({bucket, prefix, name}) => {
  const deletedKeys = new Set();
  let objects;
  try {
    objects = await fetchInventory({bucket, prefix, name});
  } catch (e) {
    utils.warn(`Error while fetching s3 inventory for ${name}: ${e.message}`)
    return [];
  }
  objects = objects.filter((item) => {
    if (item.IsDeleteMarker === "true") {
      deletedKeys.add(item.Key);
      return false;
    }
    return true;
  }).map((item) => {
    item.LastModifiedDate = item.LastModifiedDate.split("T")[0]
    item.deleted = deletedKeys.has(item.Key);
    // a bucket without versioning enabled will not have the `IsLatest` key
    if (!Object.hasOwn(item, 'IsLatest')) item.IsLatest = "true";
    return item;
  })
  return objects;
}


const SIDECARS = ["root-sequence", "seq", "tip-frequencies", "measurements", "sequences", "entropy", "titers"];
const DATESTAMP_REGEX = /_\d{4}-\d{2}-\d{2}$/;

/**
 * The inventory of the core bucket is a historical record of our work
 * over the years, but this isn't really what we want to display to users.
 * As some examples:
 *   - datestamped datasets should be considered alongside of the (non-datestamped) key
 *     e.g. we "<name>_YYYY-MM-DD.json" is grouped with "<name>.json"
 *   - there are plenty of old files, sidecar files etc which we exclude for now.
 *     We could expand our definition of available to include some of these in future.
 *   - we've changed the filename of datasets over time, e.g. X.json -> X_Y.json.
 *     we may choose to group these together as they are conceptually the same build
 *     (not yet implemented)
 *
 * Returns [false] if an object should not be included in the available resources
 * otherwise returns a tuple of our best representation of the "name" of the object
 * and the resource type (file / dataset / narrative).
 */
const coreBucketKeyMunger = (object) => {
  const key = object.Key;
  let name;
  /* now-deleted keys are not currently displayed, but we could consider grouping
  them with current keys if applicable */
  if (object.deleted) return [false];
  /* keys with a directory-like structure may be 'files', but we perform a bunch of ad-hoc filtering
  as we have a huge number of potential files in the core bucket and we don't want to expose them all! */
  if (key.includes("/")) {
    if (key.startsWith('files/')) {
      if (
        key.includes('/archive/')
        || key.includes('/test/')
        || key.includes('/branch/')
        || key.includes('/trial/')
        || key.includes('/test-data/')
        || key.startsWith('jen_test/')
        || key.match(/\/\d{4}-\d{2}-\d{2}_results.json/) // forecasts-ncov
        || key.endsWith('.png')                          // forecasts-ncov
      ) {
        return [false];
      }
      name = key.replace(/^files\//, '')  // don't want the files/ prefix in the displayed name
        .replace(/^workflows\//, '')      // (similarly for workflows/)
      return [name, 'file']
    }
    return [false];
  }

  if (!key.endsWith('.json')) return [false];
  /* Attempts to exclude sidecar files, manifests, search results etc */
  name = key.replace(/\.json$/, '');
  for (const suffix of SIDECARS) {
    if (name.endsWith(suffix)) return [false];
  }
  if (name.startsWith('search_') || name.startsWith('manifest_')) return [false];
  /* Auspice v1 JSONs are also excluded, but we could modify the code to accommodate these */
  if (name.endsWith('_meta') || name.endsWith('_tree')) return [false];
  /* remove YYYY-MM-DD -- i.e. we want the name of ncov_gisaid_21L_africa_1m_2023-06-02.json
  to be ncov_gisaid_21L_africa_1m so that they are grouped together. Currently all datestamps
  occur at the end of the name but we may need to relax this in the future */
  name = name.replace(DATESTAMP_REGEX, '')
  name = name.replace(/_/g, "/")
  return [name, 'dataset'];
}


export {
  parseInventory,
  coreBucketKeyMunger,
}

/**
 * Parses a S3 inventory manifest JSON file
 * @param {object} manifest
 * @returns {object} object.schema = string[]
 *                   object.inventoryKey = string
*/
function _parseManifest(manifest) {
  return {
    schema: manifest.fileSchema.split(",").map((f) => f.trim()),
    inventoryKey: manifest.files[0].key
  }
}
