import fs from 'fs';
import * as utils from './utils/index.js';
import zlib from 'zlib';
import { promisify } from 'util';
import { NotFound, BadRequest, InternalServerError } from './httpErrors.js';
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
 * ListResources is intended to respond to resource listing queries. The current
 * implementation only handles a single source Id and single resource type, but
 * this will be extended as needed.
 */
class ListResources {
  constructor(sourceIds, resourceTypes) {
    if (sourceIds.length>1) {
      throw new BadRequest(`Listing resources currently only supports a single source`)
    }
    if (resourceTypes.length>1) {
      throw new BadRequest(`Listing resources currently only supports a single resource type`)
    }
    if (!resources[sourceIds[0]]) {
      throw new BadRequest(`Source ${sourceIds[0]} does not exist in the index`)
    }
    this.sourceId = sourceIds[0];
    this.resourceType = resourceTypes[0];
  }

  coreDatasetFilter([name, ]) {
    /* Consult the manifest to and restrict our listed resources to those whose
    _first words_ appear as a top-level key the manifest. Subsequent words
    aren't checked, so datasets may be returned which aren't explicitly defined
    in the manifest.

    This is very similar to restricting based on the routing rules (e.g. using
    `coreBuildPaths`) however the manifest is a subset of those and is used here
    as the listed resources should be those for which we have added the pathogen
    name to the manifest.
    */
    if (!this._coreDatasetFirstWords) {
      this._coreDatasetFirstWords = new Set(
        global?.availableDatasets?.core?.map((path) => path.split("/")[0]) || []
      );
    }
    return this._coreDatasetFirstWords.has(name.split("/")[0])
  }

  pathPrefixBySource(name) {
    /**
     * We separate out the "source part" from the "pathParts" part in our
     * routing logic, creating corresponding Source and Resource objects. Here
     * we go in the other direction. We could link the two approaches in the
     * future if it's felt this duplication is too brittle.
     */
    switch (name) {
      case "core":
        return ""
      case "staging":
        return "staging/"
      default:
        throw new InternalServerError(`Source "${name}" does not have a corresponding prefix`)
    }
  }


  get data() {
    const _resources = resources?.[this.sourceId]?.[this.resourceType];
    if (!_resources) {
      throw new NotFound(`No resources exist for the provided source-id / resource-type`);
    }
    if (this.resourceType !== 'dataset') {
      throw new InternalServerError(`Resource listing is currently only implemented for datasets`);
    }
    const pathVersions = Object.fromEntries(
      Object.entries(_resources).map(([name, data]) => {
        return [name, data.versions.map((v) => v.date)];
      })
      .filter((d) => this.sourceId==='core' ? this.coreDatasetFilter(d) : true)
    )
    const d = {}
    d[this.resourceType] = {}
    d[this.resourceType][this.sourceId] = {
      pathVersions,
      pathPrefix: this.pathPrefixBySource(this.sourceId)
    }
    return d;
  }
}


export {
  ResourceVersions,
  ListResources,
  updateResourceVersions,
}