import * as fs from 'node:fs/promises';
import neatCsv from 'neat-csv';
import zlib from 'zlib';
import { promisify } from 'util';

const gunzip = promisify(zlib.gunzip)

/**
 * Currently this reads files from disk for development purposes, but a future commit
 * will change this to reading from S3
 * 
 * @returns {object[]} list of entries in the inventory, using the schema to define keys
 */
const fetchInventory = async () => {
  // list the provided (TODO) s3 prefix (can assume it's not paginated since we will use lifecycle policies)
  // Find the latest directory (via simple sorting) and download the manifest.json from there
  const manifestHandle = fs.open('./devData/core.manifest.json', 'r');
  const manifest = JSON.parse(
    await manifestHandle.then((handle) => handle.readFile())
  )
  manifestHandle.then((handle) => handle.close()) // P.S. close() is a promise
  const schema = manifest.fileSchema.split(",").map((f) => f.trim());
  // the manifest contains the s3 object key for the inventory to fetch (a .csv.gz file)
  const inventoryHandle = fs.open('./devData/core.inventory.csv.gz', 'r');
  const inventory = await inventoryHandle
      .then((handle) => handle.readFile())
      .then((buffer) => gunzip(buffer))
      .then((data) => neatCsv(data, schema))
  inventoryHandle.then((handle) => handle.close()) // P.S. close() is a promise
  return inventory;
}

/**
 * Returns a list of objects in the requested S3 inventory, which itself represents a list of
 * objects + versions within a specific bucket+prefix. Minimal filtering is performed to remove
 * delete markers and to change the last modified timestamp into a datestamp
 * @returns {object[]}
 */
const parseInventory = async () => {
  const deletedKeys = new Set();
  let objects = await fetchInventory();
  objects = objects.filter((item) => {
    if (item.IsDeleteMarker === "true") {
      deletedKeys.add(item.Key);
      return false;
    }
    return true;
  }).map((item) => {
    item.LastModifiedDate = item.LastModifiedDate.split("T")[0]
    item.deleted = deletedKeys.has(item.Key);
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
  /* now-deleted keys are not currently displayed, but we could consider grouping
  them with current keys if applicable */
  if (object.deleted) return [false];
  /* keys with a directory-like structure + non-JSON keys are not considered,
  but they will be when we start listing available intermediate files */
  if (key.includes("/")) return [false];
  if (!key.endsWith('.json')) return [false];
  /* Attempts to exclude sidecar files, manifests, search results etc */
  let name = key.replace(/\.json$/, '');
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