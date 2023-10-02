import fs from 'fs';
import * as utils from './utils/index.js';
import zlib from 'zlib';
import { promisify } from 'util';
import AWS from 'aws-sdk';
import { NotFound, BadRequest } from './httpErrors.js';
import { RESOURCE_INDEX } from './config.js';

const gunzip = promisify(zlib.gunzip)

const LATEST = "LATEST"
let resources = {};
let eTag;

class ResourceVersions {
  constructor(sourceId, resourceType, resourcePath) {
    this.data = {};
    if (!resources[sourceId]) {
      utils.verbose(`Attempted to access resources for source ID ${sourceId} but this is not present in the index`);
      return;
    }
    if (!resources[sourceId][resourceType]) {
      utils.verbose(`Attempted to access resources for ${sourceId} / ${resourceType} but there are none in the index`);
      return;
    }
    this.data = resources[sourceId][resourceType][resourcePath] || {};
  }

  /**
   * Given a (URL-provided) versionDescriptor return the YYYY-MM-DD version ID
   * which corresponds to the desired resource version. This ID can then access
   * specific information about the version via the subresourceUrls method.
   *
   * @throws {BadRequest} if the versionDescriptor is not YYYY-MM-DD.
   * @throws {NotFound} if there are versions present in the index, but the
   * versionDescriptor identifies a version which predated those present.
   * @throws {NotFound} if there is no data about the resource in the index
   * (i.e. no versions)
   * @returns {LATEST} if the versionDescriptor is more recent than the most
   * recent version in the index.
   * @returns {String} the YYYY-MM-DD version ID
   */
  versionIdFromDescriptor(versionDescriptor) {
    if (!versionDescriptor.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new BadRequest(`Version descriptor ("${versionDescriptor}" must be YYYY-MM-DD`)
    }

    const dates = (this.data?.versions || [])
      .map((v) => v.date)
      .sort();

    if (!dates.length) {
      throw new NotFound(`Attempted to lookup a version for ${versionDescriptor} however this resource has no versions in the index`)
    }
    if (versionDescriptor < dates[0]) {
      throw new NotFound(`Version descriptor ${versionDescriptor} predates available versions`)
    }
    if (versionDescriptor > dates[dates.length - 1]) {
      return LATEST;
    }

    let id;
    for (const date of dates) {
      if (date <= versionDescriptor) {
        id = date;
      }
    }
    return id;
  }

  /**
   * Given a YYYY-MM-DD string, return the available subresources and their corresponding URLs
   */
  subresourceUrls(date) {
    for (const version of this.data?.versions || []) {
      if (version.date===date) {
        return version.fileUrls;
      }
    }
    throw new Error(`Attempted to access a specific date which doesn't exist in the resource index: ${date}`)
  }

}


/**
 * Updates provided data in-place by fetching the file on disk.
 * We expose an update function rather than automatically updating here. This
 * prevents scripts / tests which (indirectly) import this file unintentionally
 * fetching stuff from S3 (and often failing due to missing credentials).
 */
async function updateResourceVersions() {
  if (RESOURCE_INDEX) {
    utils.verbose(`Updating available resources index from ${RESOURCE_INDEX}`);
    let fileContents = fs.readFileSync(RESOURCE_INDEX)
    if (RESOURCE_INDEX.endsWith('.gz')) {
      fileContents = await gunzip(fileContents)
    }
    resources = JSON.parse(fileContents);
  } else {
    const [Bucket, Key] = ['nextstrain-inventories', 'resources.json.gz'];
    utils.verbose(`Updating available resources index from s3://${Bucket}/${Key}`);
    const S3 = new AWS.S3();
    try {
      const newETag = (await S3.headObject({Bucket, Key}).promise()).ETag;
      if (newETag && newETag === eTag) {
        utils.verbose("Skipping available resource update as eTag hasn't changed");
        return;
      }
      /* NOTE: in AWS SDK v2 response.Body is a buffer; in v3 it's a stream */
      const newResources = JSON.parse(
        await S3.getObject({Bucket, Key}).promise()
          .then((response) => gunzip(response.Body))
      );
      [resources, eTag] = [newResources, newETag];
    } catch (err) {
      utils.warn(`Resource updating failed: ${err.message}`)
      return;
    }
  }
}

export {
  ResourceVersions,

  updateResourceVersions,

  LATEST,
}