import fs from 'fs';
import * as utils from './utils/index.js';
import zlib from 'zlib';
import { promisify } from 'util';
import { NotFound, BadRequest } from './httpErrors.js';
import { RESOURCE_INDEX } from './config.js';
import { signedUrl } from './s3.js';
import { fetch } from './fetch.js';

const gunzip = promisify(zlib.gunzip)

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
   * Given a (URL-provided) versionDescriptor return the YYYY-MM-DD date which
   * corresponds to the desired resource version, if applicable. This can then
   * be used to access specific information about the version via the
   * `subresourceUrls` method.
   *
   * @throws {BadRequest} if the versionDescriptor is not YYYY-MM-DD.
   * @throws {NotFound} if there are versions present in the index, but the
   * versionDescriptor identifies a version which predated those present.
   * @throws {NotFound} if there is no data about the resource in the index
   * (i.e. no versions)
   * @returns {(string|null)} the YYYY-MM-DD version ID or null if the
   * versionDescriptor is more recent than the most recent version in the index
   */
  versionDateFromDescriptor(versionDescriptor) {
    if (!versionDescriptor.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new BadRequest(`Requested version must be in YYYY-MM-DD format (version descriptor requested: "${versionDescriptor}")`)
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
      return null;
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
 * Updates provided data in-place by fetching the file from S3 or from disk.
 *
 * If the index is on S3, we first make a HEAD request to obtain the eTag and
 * compare this to the previous update to avoid unnecessary updates.
 *
 * @returns {undefined}
 */
async function updateResourceVersions() {

  if (RESOURCE_INDEX.startsWith("s3://")) {
    const parts = RESOURCE_INDEX.match(/^s3:\/\/(.+?)\/(.+)$/);
    const [Bucket, Key] = [parts[1], parts[2]];
    utils.verbose(`[RESOURCE INDEX UPDATE S3] Fetching index from s3://${Bucket}/${Key}`);
    try {
      const newETag = (await fetch(await signedUrl({bucket:Bucket, key:Key, method: 'HEAD'}), {method: 'HEAD'}))
        .headers.get('etag'); // value is enclosed in double quotes, but that doesn't matter for our purposes
      if (newETag && newETag === eTag) {
        utils.verbose(`[RESOURCE INDEX UPDATE S3] Skipping as eTag hasn't changed: ${eTag}`);
        return;
      }
      const res = await fetch(await signedUrl({bucket:Bucket, key:Key, method: 'GET'}), {method: 'GET'})
      if (res.status !== 200) {
        throw new Error(`Non-200 response code "${res.status}".`);
      }
      const newResources = JSON.parse(await gunzip(await res.buffer()));
      [resources, eTag] = [newResources, newETag];
      utils.verbose(`[RESOURCE INDEX UPDATE S3] Updated. New eTag: ${eTag}`);
    } catch (err) {
      utils.warn(`[RESOURCE INDEX UPDATE S3] updating failed: ${err.message}`)
    }
    return;
  }

  // We now assume it's a local file path (the docs state S3 or local file). Any
  // attempt to use a non-local (e.g. HTTP) address will result in the fatal error
  // "Error: ENOENT: no such file or directory" on server start.
  utils.verbose(`Updating available resources index from local file ${RESOURCE_INDEX}`);
  let fileContents = fs.readFileSync(RESOURCE_INDEX)
  if (RESOURCE_INDEX.endsWith('.gz')) {
    fileContents = await gunzip(fileContents)
  }
  resources = JSON.parse(fileContents);
}

/**
 * XXX FIXME - class is a stub
 */
class ListResources {
  constructor() {
    // process query params here?
  }
  get data() {

    /**
     * TODO - don't hardcode these, use our routing rules instead. TODO XXX
     */
    const skipFirstWords = [
      "zika-test", "zika-tutorial-metadata-via-api", "zika-v2",
      "ncovRegional", "ncov-country-dta-w-frequencies", "ncov-priorities", "ncov-with-priorities", "ncovRefocus","ncov-test", "ncov-2020-01-24",
      "seattle-flu-mock",
      "seasonal-flu", "avian-flu", // these exist in preparation for an upcoming namespace shift
    ]

    /* Subset for dev purposes (prior to API working properly) to flu datasets, zika and rsv */
    const datasets = Object.fromEntries(
      Object.entries(resources.core.dataset).map(([name, data]) => {
        // if (['zika', 'flu', 'rsv', 'dengue'].includes(name.split('/')[0])) {
        //   return [name, data.versions.map((v) => v.date)];
        // }
        // return undefined;
        return [name, data.versions.map((v) => v.date)];
      })
      .filter((d) => {
        /* This filtering should be applied upstream to the index creation script */
        if (d && d[0].endsWith('/frequencies')) return undefined;
        if (d && d[0].endsWith('/2019-09')) return undefined;
        if (d && d[0].startsWith('zika/')) return undefined;
        if (d && skipFirstWords.includes(d[0].split("/")[0])) return undefined;
        return d
      })
      .filter((el) => !!el)
    )
    return {datasets}
  }
}


export {
  ResourceVersions,
  ListResources,
  updateResourceVersions,
}