import * as fs from 'node:fs/promises';
import neatCsv from 'neat-csv';
import zlib from 'zlib';
import { promisify } from 'util';
import AWS from 'aws-sdk';
import {logger} from './logger.js';
import { DateTime } from 'luxon';
import escapeStringRegexp from 'escape-string-regexp';
import { ResourceIndexerError } from './errors.js';
const gunzip = promisify(zlib.gunzip)

/**
 * Fetches and reads the latest inventory from the provided bucket/prefix:
 *    - finds the most recent manifest.json via comparison of timestamps in keys
 *    - uses this manifest.json to get the schema + key of the actual inventory
 *    - gets the actual inventory & returns the data as an object[] with keys from the schema
 * 
 * Note that we only read a maximum of 999 keys from the provided bucket+prefix. A typical inventory
 * update adds ~4 keys, so this should allow for ~8 months of inventories. The bucket where inventories
 * are stored should use lifecycles to expire objects.
 * 
 * Returns an object with properties:
 * - inventory: object[]      list of entries in the inventory, using the schema to define keys
 * - versionsExist: boolean   are key versions present within the bucket?
 */
const fetchInventoryRemote = async ({bucket, prefix, name}) => {
  const S3 = new AWS.S3();
  const _prefix = escapeStringRegexp(prefix.replace(/\/*$/, "/"));
  const manifestKeyPattern = new RegExp(`^${_prefix}\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}Z/manifest\\.json$`);
  const manifestKey = await new Promise((resolve, reject) => {
    S3.listObjectsV2({Bucket: bucket, Prefix: prefix, MaxKeys: 999}, (err, data) => {
      if (err) return reject(err);
      const orderedKeys = data.Contents
        .map((object) => object.Key)
        .filter((key) => key.match(manifestKeyPattern))
        .sort()     // keys are identical except for a YYYY-MM-DDTHH-MMZ timestamp within the key itself
        .reverse(); // now sorted most recent object first
      if (orderedKeys.length===0) reject("No valid inventory manifest.json found")
      resolve(orderedKeys[0])
    });
  });
  logger.info(`inventory for ${name} - manifest key: ${manifestKey}`)

  const {schema, inventoryKey, versionsExist} = await S3.getObject({Bucket: bucket, Key: manifestKey})
    .promise()
    .then((response) => _parseManifest(JSON.parse(response.Body.toString('utf-8'))));

  logger.info(`inventory for ${name} - parsed manifest JSON`)

  const inventory = await S3.getObject({Bucket: bucket, Key: inventoryKey})
    .promise()
    .then((response) => gunzip(response.Body))
    .then((data) => neatCsv(data, schema));

  logger.info(`inventory for ${name} - fetched ${inventory.length} rows`)
  return {inventory, versionsExist};
}

/**
 * Parse an on-disk inventory. This expects the following files to be present:
 *    - `./devData/${name}.manifest.json`
 *    - `./devData/${name}.inventory.csv.gz`
 * 
 * Returns an object with properties:
 * - inventory: object[]      list of entries in the inventory, using the schema to define keys
 * - versionsExist: boolean   are key versions present within the bucket?
 */
const fetchInventoryLocal = async ({name}) => {
  const manifestPath = `./devData/${name}.manifest.json`;
  const inventoryPath = `./devData/${name}.inventory.csv.gz`;
  logger.info(`inventory for ${name} -- reading S3 inventories from ${manifestPath} and ${inventoryPath}`);
  const manifest = JSON.parse(await fs.readFile(manifestPath));
  const {schema, versionsExist} = _parseManifest(manifest);
  const decompress = inventoryPath.toLowerCase().endsWith('.gz') ? gunzip : (x) => x;
  const inventory = await neatCsv(await decompress(await fs.readFile(inventoryPath)), schema);
  logger.info(`inventory for ${name} - read ${inventory.length} rows from the local file`)
  return {inventory, versionsExist};
}


/**
 * Returns a list of objects in the requested S3 inventory, which itself
 * represents a list of objects + versions within a specific bucket+prefix.
 * Objects which should be "deleted" are removed from the returned objects (see
 * `removeDeletedObjects` for more)
 * 
 * Function is exported as it is used in tests.
 */
export const parseInventory = async ({objects, versionsExist}) => {
  // Ensure all objects are chronological
  objects = objects.map((item) => {
    item.timestamp = DateTime.fromISO(item.LastModifiedDate)
    return item;
  }).sort((a, b) => b.timestamp - a.timestamp);

  objects = versionsExist ? _checkVersionedObjects(objects) : _checkNonVersionedObjects(objects);
  objects = _removeDeletedObjects(objects);

  /* rename / prune / add properties as I find the default S3 properties /
  values awkward to work with */
  return objects.map((item) => {
    return {
      timestamp: item.timestamp,
      date: item.LastModifiedDate.split("T")[0],
      key: item.Key,
      bucket: item.Bucket,
      versionId: item.VersionId, // will be undefined if bucket is not versioned
      latest: versionsExist ? item.IsLatest==='true' : true,
    }
  });
}


/**
 * Fetch and parse the latest inventory in the inventoryBucket / inventoryPrefix
 * _or_ source a local inventory file (useful for dev purposes to avoid constant
 * downloads from S3)
 * @returns S3Object[]
 */
export const collectInventory = async ({name, local, inventoryBucket, inventoryPrefix}) => {
  let objects, versionsExist;
  try {
    const fetchInventory = local ? fetchInventoryLocal : fetchInventoryRemote;
    ({ inventory: objects, versionsExist} = await fetchInventory(
      {bucket: inventoryBucket, prefix: inventoryPrefix, name}
    ));
  } catch (e) {
    logger.error(`There was an error while fetching the S3 inventory for ${name}. This is fatal.`)
    throw e;
  }
  return await parseInventory({objects, versionsExist})
}

/**
 * For a versioned bucked, ensure that version ID is present on every object
 * by filtering out those without a valid-looking version ID. For instance,
 * s3://nextstrain-data/WNV_NA_tree.json from 2018-05-09 has an empty-string version ID.
 * These may represent objects from before versioning was enabled.
 * @param {S3Item[]} Objects chronologically sorted, latest first
 */
function _checkVersionedObjects(objects) {
  const keysSeen = new Set();

  return objects.filter((item) => {
    if (!item.VersionId) {
      logger.verbose(`Object ${item.Bucket}/${item.Key} is ignored as it is missing a versionId in a bucket we consider to be versioned.`);
      return false;
    }
    if (!item.hasOwnProperty('IsLatest')) { // eslint-disable-line no-prototype-builtins
      throw new ResourceIndexerError(`Object ${item.Bucket}/${item.Key} is unexpectedly missing the IsLatest property.`);
    }
    return true;
  })
    .map((item) => {
      if (item.IsLatest === 'true') {
        if (keysSeen.has(item.Key)) {
          throw new ResourceIndexerError(`
            These appears to be something amiss for S3 objects ${item.Bucket}/${item.Key}.
            Specifically, the version ${item.VersionId} is considered by S3 to be the latest,
            however it is not the most recent after sorting on LastModified.
            This may result in an invalid index and so this is a fatal error.
          `.replace(/\s+/g, ' '))
        }
        keysSeen.add(item.Key);
      } else {
        if (!keysSeen.has(item.Key)) {
          throw new ResourceIndexerError(`
            These appears to be something amiss for S3 objects ${item.Bucket}/${item.Key}.
            Specifically, the most recent object (via sorting on LastModified, version ID:
            ${item.VersionId}) is not classified by S3 as the latest.
            This may result in an invalid index and so this is a fatal error.
          `.replace(/\s+/g, ' '))
        }
      }
      return item;
    })
}

/**
 * For a non-versioned object, check that the VersionId is _not_ present and that keys are never duplicated.
 * Adds the property 'IsLatest' = 'true' for every object
 */
function _checkNonVersionedObjects(objects) {
  const keys = new Set();
  objects.forEach((item) => {
    if (item.hasOwnProperty('VersionId')) { // eslint-disable-line no-prototype-builtins
      logger.verbose(`Object ${item.Bucket}/${item.Key} has a versionId ('${item.VersionId}') but the bucket is not versioned! The item will be ignored.`);
      return false;
    }
    if (keys.has(item.Key)) {
      throw new ResourceIndexerError(`
        The S3 Object for ${item.Bucket}/${item.Key} (unexpectedly) appears multiple times in an un-versioned bucket.
        This may result in a corrupted index and so is a fatal error.
      `.replace(/\s+/g, ' '))
    }
    keys.add(item.Key);
  })
  return objects;

}

/**
 * When encountering a delete marker, we remove the delete marker itself and the
 * most recent (but older in time) object with a matching s3 key. Back-to-back
 * delete markers behave like a single delete marker.
 *
 * Non-versioned buckets don't have delete markers, and it's safe to run this
 * function for them.
 *
 * @param {S3Item[]} Objects chronologically sorted, most recent first
 * @returns {S3Item[]}
 */
function _removeDeletedObjects(objects) {
  // For a given (s3) key, was the previously encountered object (i.e. more
  // recent in time) a delete marker?
  const behindDeleteMarker = {}

  return objects.filter((item) => {
    const key = item.Key;
    if (item.IsDeleteMarker === "true") {
      behindDeleteMarker[key] = true;
      return false;
    }
    if (behindDeleteMarker[key]) {
      behindDeleteMarker[key] = false;
      return false
    }
    return true;
  })
}

/**
 * Parses a S3 inventory manifest JSON file
 * @param {object} manifest
 * @returns {object} object.schema = string[]
 *                   object.inventoryKey = string
*/
function _parseManifest(manifest) {
  if (manifest.files.length>1) {
    throw new ResourceIndexerError(`
      The manifest file for the S3 inventory for bucket ${manifest.sourceBucket}
      includes more than one inventory file. This situation was not encountered
      during development, but this is presumably caused by the inventory size
      exceeding some threshold and being chunked into multiple files. Please check
      this is indeed the case and, if so, amend the code to parse and join each file.
    `.replace(/\s+/g, ' '))
  }
  const schema = manifest.fileSchema.split(",").map((f) => f.trim());
  return {
    schema,
    inventoryKey: manifest.files[0].key,
    // If a schema uses 'VersionId' then versions may exist in the inventory, so
    // we want to check for them. It may be possible to produce manifests of
    // versioned buckets but not include this in the manifest, and if so we'll
    // treat it as if it were an unversioned bucket.
    versionsExist: schema.includes('VersionId'),
  }
}

