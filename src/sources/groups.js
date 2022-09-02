/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
import AWS from 'aws-sdk';

import { Buffer } from 'buffer';
import yamlFront from 'yaml-front-matter';
import authz from '../authz';
import { fetch } from '../fetch';
import { Group } from '../groups';
import utils from '../utils';
import { Source, Dataset, Narrative } from './models';

const S3 = new AWS.S3();

const MULTI_TENANT_BUCKET = "nextstrain-groups";


class GroupSource extends Source {
  constructor(groupOrName) {
    super();

    this.group = groupOrName instanceof Group
      ? groupOrName
      : new Group(groupOrName);
  }

  get authzPolicy() {
    const basePolicy = authzPolicy(this.group);

    const publicPolicy = [
      /* No role restriction on reading anything tagged "public".
       */
      {tag: authz.tags.Visibility.Public, role: "*", allow: [authz.actions.Read]},
    ];

    return this.group.isPublic
      ? basePolicy.concat(publicPolicy)
      : basePolicy;
  }

  get authzTags() {
    return new Set(
      this.group.isPublic
        ? [authz.tags.Type.Source, authz.tags.Visibility.Public]
        : [authz.tags.Type.Source]
    );
  }
  get authzTagsToPropagate() {
    return new Set(
      this.group.isPublic
        ? [authz.tags.Visibility.Public]
        : []
    );
  }

  get bucket() {
    return this.group.bucket ?? MULTI_TENANT_BUCKET;
  }

  get prefix() {
    return this.bucket === MULTI_TENANT_BUCKET
      ? `${this.group.name}/`
      : "";
  }

  dataset(pathParts) {
    return new GroupDataset(this, pathParts);
  }
  narrative(pathParts) {
    return new GroupNarrative(this, pathParts);
  }

  async urlFor(path, method = 'GET', headers = {}) {
    const normalizedHeaders = utils.normalizeHeaders(headers);
    const action = {
      GET: { name: "getObject" },
      HEAD: { name: "headObject" },
      PUT: {
        name: "putObject",
        params: {
          ContentType: normalizedHeaders["content-type"],
          ContentEncoding: normalizedHeaders["content-encoding"],
        },
      },
      DELETE: { name: "deleteObject" },
    };

    if (!action[method]) throw new Error(`Unsupported method: ${method}`);

    return S3.getSignedUrl(action[method].name, {
      Expires: expires(),
      Bucket: this.bucket,
      Key: `${this.prefix}${path}`,
      ...action[method].params,
    });
  }
  async _listFiles(listPrefix = "") {
    const prefix = this.prefix + listPrefix;

    return new Promise((resolve, reject) => {
      let files = [];
      S3.listObjectsV2({Bucket: this.bucket, Prefix: prefix}).eachPage((err, data, done) => {
        if (err) {
          utils.warn(`Could not list S3 objects for group '${this.group.name}'\n${err.message}`);
          return reject(err);
        }
        if (data===null) { // no more data
          return resolve(files);
        }

        /* Remove the prefix from the key, producing a plain "file" name.  The
         * filter on startsWith is unnecessary in theory given the Prefix param
         * of listObjectsV2 above, but it guards against something going awry.
         *   -trs, 16 Feb 2022
         */
        files = files.concat(
          data.Contents
            .map(object => object.Key)
            .filter(key => key.startsWith(prefix))
            .map(key => key.slice(prefix.length))
        );
        return done();
      });
    });
  }
  async availableDatasets() {
    const prefix = this.bucket === MULTI_TENANT_BUCKET
      ? "datasets/"
      : "";
    const files = await this._listFiles(prefix);
    const pathnames = utils.getDatasetsFromListOfFilenames(files);
    return pathnames;
  }
  async availableNarratives() {
    // Walking logic borrowed from auspice's cli/server/getAvailable.js
    const prefix = this.bucket === MULTI_TENANT_BUCKET
      ? "narratives/"
      : "";
    const files = await this._listFiles(prefix);
    return files
      .filter((file) => file !== 'group-overview.md')
      .filter((file) => file.endsWith(".md"))
      .map((file) => file
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
  }
  parseOverviewMarkdown(overviewMarkdown) {
    const frontMatter = yamlFront.safeLoadFront(overviewMarkdown);

    let {title, byline, website, showDatasets, showNarratives} = frontMatter;

    // Must be an allowed protocol
    if (website != null) {
      const {protocol} = parseUrl(website) ?? {};
      const allowedProtocols = new Set(["https:", "http:", "ftp:", "ftps:", "mailto:"]);
      if (!allowedProtocols.has(protocol)) {
        website = undefined;
      }
    }

    // Must be booleans
    if (typeof showDatasets !== 'boolean') {
      showDatasets = undefined;
    }
    if (typeof showNarratives !== 'boolean') {
      showNarratives = undefined;
    }

    // handle files with CRLF endings (windows)
    const content = frontMatter.__content.replace(/\r\n/g, "\n");

    return {
      title,
      byline,
      website,
      showDatasets,
      showNarratives,
      content: content.match(/\S/) ? content : undefined,
    };
  }
  /**
   * Get information about a (particular) source.
   * The data could be a JSON, or a markdown with YAML frontmatter. Or something else.
   * This is very similar to our previous discussions around moving the auspice footer
   * content to the dataset JSON. One advantage of this being outside of the auspice
   * codebase is that we can iterate on it after pushing live to nextstrain.org
   */
  async getInfo() {
    const defaults = {
      title: `"${this.group.name}" Nextstrain group`,
      overview: `The available datasets and narratives in this group are listed below.`,
      showDatasets: true,
      showNarratives: true,
    };

    try {
      /* attempt to fetch customisable information from S3 bucket */
      const [logoResponse, overviewResponse] = await Promise.all([
        fetch(await this.urlFor("group-logo.png"), {cache: "no-cache"}),
        fetch(await this.urlFor("group-overview.md"), {cache: "no-cache"}),
      ]);

      const logoSrc = logoResponse.status === 200
        ? await asDataUrl(logoResponse)
        : null;

      const overview = overviewResponse.status === 200
        ? this.parseOverviewMarkdown(await overviewResponse.text())
        : {};

      const {
        title = defaults.title,
        byline,
        website,
        showDatasets = defaults.showDatasets,
        showNarratives = defaults.showNarratives,
        content = defaults.overview,
      } = overview;

      return {
        title,
        byline,
        website,
        showDatasets,
        showNarratives,
        avatar: logoSrc,
        overview: content,
      };
    } catch (err) {
      /* Appropriate fallback if no customised data is available */
      return {
        ...defaults,
        error: `Error in custom group info: ${err.message}`
      };
    }
  }
}


class GroupDataset extends Dataset {
  get baseName() {
    return this.source.bucket === MULTI_TENANT_BUCKET
      ? `datasets/${super.baseName}`
      : super.baseName;
  }
}


class GroupNarrative extends Narrative {
  get baseName() {
    return this.source.bucket === MULTI_TENANT_BUCKET
      ? `narratives/${super.baseName}`
      : super.baseName;
  }
}


/**
 * Generate the authorization policy for a given Nextstrain Group.
 *
 * Currently generated from a statically-defined policy template, but in the
 * future could retrieve a per-group, owner-defined, stored policy which makes
 * use of both system- and user-defined tags and roles.
 *
 * @param {Group} group
 * @returns {authzPolicy}
 */
function authzPolicy(group) {
  const {Read, Write} = authz.actions;
  const {Type} = authz.tags;

  const viewers = group.membershipRoles.get("viewers");
  const editors = group.membershipRoles.get("editors");
  const owners = group.membershipRoles.get("owners");

  return [
    /* eslint-disable no-multi-spaces */

    /* All membership roles in a Nextstrain Group can see information about the
     * group Source instance.
     */
    {tag: Type.Source, role: viewers, allow: [Read]},
    {tag: Type.Source, role: editors, allow: [Read]},
    {tag: Type.Source, role: owners,  allow: [Read]},

    /* Editors and Owners can create/update/delete datasets and narratives, but
     * Viewers can only see them.
     */
    {tag: Type.Dataset, role: viewers, allow: [Read]},
    {tag: Type.Dataset, role: editors, allow: [Read, Write]},
    {tag: Type.Dataset, role: owners,  allow: [Read, Write]},

    {tag: Type.Narrative, role: viewers, allow: [Read]},
    {tag: Type.Narrative, role: editors, allow: [Read, Write]},
    {tag: Type.Narrative, role: owners,  allow: [Read, Write]},

    /* eslint-enable no-multi-spaces */
  ];
}


/**
 * Seconds until current expiration point.
 *
 * A fixed expiration point of 2 hours after the start of the current clock
 * hour is calculated, and the time remaining until then is returned.  This
 * will range between 1 and 2 hours.
 *
 * This technique allows us to generate stable S3 signed URLs for each clock
 * hour, thus making them cachable.
 *
 * @returns {number} seconds
 */
function expires() {
  const now = Math.ceil(Date.now() / 1000); // seconds since Unix epoch
  const hours = 3600; // seconds

  const startOfCurrentHour = now - (now % hours);
  const expiresAt = startOfCurrentHour + 2*hours;

  return expiresAt - now;
}


/**
 * Construct a data: URL from a Response.
 *
 * The data: URL will be constructed from the response Content-Type and the
 * response body after base64-encoding.
 *
 * @param {fetch.Response} response
 * @returns {string}
 */
async function asDataUrl(response) {
  const data = Buffer.from(await response.arrayBuffer()).toString("base64");
  const type = response.headers.get("content-type");

  return `data:${type};base64,${data}`;
}

/**
 * Parse a potentially invalid URL.
 *
 * Returns a URL object if successful, or null if the given URL is invalid.
 *
 * @param {string} url
 * @returns {URL|null}
 */
function parseUrl(url) {
  try {
    return new URL(url);
  } catch (err) {
    if (err instanceof TypeError && err.code === "ERR_INVALID_URL") {
      return null;
    }
    throw err;
  }
}


export default {
  GroupSource,
};
