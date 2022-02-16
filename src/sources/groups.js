/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
const AWS = require("aws-sdk");
const {Buffer} = require("buffer");
const yamlFront = require("yaml-front-matter");

const authz = require("../authz");
const {fetch} = require("../fetch");
const {Group} = require("../groups");
const utils = require("../utils");
const {Source} = require("./models");

const S3 = new AWS.S3();


class GroupSource extends Source {
  constructor(groupOrName) {
    super();

    this.group = groupOrName instanceof Group
      ? groupOrName
      : new Group(groupOrName);
  }

  get authzPolicy() {
    const basePolicy = authzPolicy(this.group.name);

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
    return this.group.bucket;
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
      Key: path,
      ...action[method].params,
    });
  }
  async _listObjects() {
    return new Promise((resolve, reject) => {
      let contents = [];
      S3.listObjectsV2({Bucket: this.bucket}).eachPage((err, data, done) => {
        if (err) {
          utils.warn(`Could not list S3 objects for group '${this.group.name}'\n${err.message}`);
          return reject(err);
        }
        if (data===null) { // no more data
          return resolve(contents);
        }
        contents = contents.concat(data.Contents);
        return done();
      });
    });
  }
  async availableDatasets() {
    const objects = await this._listObjects();
    const pathnames = utils.getDatasetsFromListOfFilenames(objects.map((object) => object.Key));
    return pathnames;
  }
  async availableNarratives() {
    // Walking logic borrowed from auspice's cli/server/getAvailable.js
    const objects = await this._listObjects();
    return objects
      .map((object) => object.Key)
      .filter((file) => file !== 'group-overview.md')
      .filter((file) => file.endsWith(".md"))
      .map((file) => file
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
  }
  parseOverviewMarkdown(overviewMarkdown) {
    const frontMatter = yamlFront.loadFront(overviewMarkdown);
    if (!frontMatter.title) {
      throw new Error("The overview file requires `title` in the frontmatter.");
    }

    if (frontMatter.website) {
      if (!frontMatter.website.includes("http")) {
        throw new Error("The website field in the overview file requires \"http\" to be present.");
      }
    }

    if (frontMatter.showDatasets && typeof frontMatter.showDatasets !== 'boolean') {
      throw new Error("The `showDatasets` field in the frontmatter must be a boolean.");
    }

    if (frontMatter.showNarratives && typeof frontMatter.showNarratives !== 'boolean') {
      throw new Error("The `showNarratives` field in the frontmatter must be a boolean.");
    }

    // handle files with CRLF endings (windows)
    const content = frontMatter.__content.replace(/\r\n/g, "\n");

    return [frontMatter.title, frontMatter.byline, frontMatter.website, frontMatter.showDatasets, frontMatter.showNarratives, content];
  }
  /**
   * Get information about a (particular) source.
   * The data could be a JSON, or a markdown with YAML frontmatter. Or something else.
   * This is very similar to our previous discussions around moving the auspice footer
   * content to the dataset JSON. One advantage of this being outside of the auspice
   * codebase is that we can iterate on it after pushing live to nextstrain.org
   */
  async getInfo() {
    try {
      /* attempt to fetch customisable information from S3 bucket */
      const [logoResponse, overviewResponse] = await Promise.all([
        fetch(await this.urlFor("group-logo.png"), {cache: "no-cache"}),
        fetch(await this.urlFor("group-overview.md"), {cache: "no-cache"}),
      ]);

      const logoSrc = logoResponse.status === 200
        ? await asDataUrl(logoResponse)
        : null;

      let title = `"${this.group.name}" Nextstrain group`;
      let byline = `The available datasets and narratives in this group are listed below.`;
      let website = null;
      let showDatasets = true;
      let showNarratives = true;
      let overview;
      if (overviewResponse.status === 200) {
        const overviewContent = await overviewResponse.text();
        [title, byline, website, showDatasets, showNarratives, overview] = this.parseOverviewMarkdown(overviewContent);
        // Default show datasets & narratives if not specified in customization
        if (showDatasets == null) showDatasets = true;
        if (showNarratives == null) showNarratives = true;
      }

      return {
        title: title,
        byline: byline,
        website: website,
        showDatasets: showDatasets,
        showNarratives: showNarratives,
        avatar: logoSrc,
        overview: overview
      };

    } catch (err) {
      /* Appropriate fallback if no customised data is available */
      return {
        title: `"${this.group.name}" Nextstrain group`,
        byline: `The available datasets and narratives in this group are listed below.`,
        website: null,
        showDatasets: true,
        showNarratives: true,
        error: `Error in custom group info: ${err.message}`
      };
    }
  }
}


/**
 * Generate the authorization policy for a given Nextstrain Group.
 *
 * Currently generated from a statically-defined policy template, but in the
 * future could retrieve a per-group, owner-defined, stored policy which makes
 * use of both system- and user-defined tags and roles.
 *
 * @param {string} groupName - Name of the Nextstrain Group
 * @returns {authzPolicy}
 */
function authzPolicy(groupName) {
  const {Read, Write} = authz.actions;
  const {Type} = authz.tags;

  return [
    /* eslint-disable no-multi-spaces */

    /* All membership roles in a Nextstrain Group can see information about the
     * group Source instance.
     */
    {tag: Type.Source, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Source, role: `${groupName}/editors`, allow: [Read]},
    {tag: Type.Source, role: `${groupName}/owners`,  allow: [Read]},

    /* Editors and Owners can create/update/delete datasets and narratives, but
     * Viewers can only see them.
     */
    {tag: Type.Dataset, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Dataset, role: `${groupName}/editors`, allow: [Read, Write]},
    {tag: Type.Dataset, role: `${groupName}/owners`,  allow: [Read, Write]},

    {tag: Type.Narrative, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Narrative, role: `${groupName}/editors`, allow: [Read, Write]},
    {tag: Type.Narrative, role: `${groupName}/owners`,  allow: [Read, Write]},

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


module.exports = {
  GroupSource,
};
