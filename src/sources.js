/* eslint-disable no-use-before-define */
const AWS = require("aws-sdk");
const zlib = require("zlib");
const yamlFront = require("yaml-front-matter");
const {fetch} = require("./fetch");
const queryString = require("query-string");
const {NoDatasetPathError, InvalidSourceImplementation} = require("./exceptions");
const utils = require("./utils");

const S3 = new AWS.S3();

/* These Source, Dataset, and Narrative classes contain information to map an
 * array of dataset/narrative path parts onto a URL.  Source selection and
 * dataset path aliasing (/flu → /flu/seasonal/h3n2/ha/3y) is handled in
 * getDatasetHelpers.parsePrefix().
 *
 * The class definitions would be a bit shorter/prettier if we were using Babel
 * to allow class properties on Node.
 */

class Source {
  static get _name() {
    throw new InvalidSourceImplementation("_name() must be implemented by subclasses");
  }
  get name() {
    return this.constructor._name;
  }
  get baseUrl() {
    throw new InvalidSourceImplementation("baseUrl() must be implemented by subclasses");
  }
  static isGroup() { /* is the source a "nextstrain group"? */
    return false;
  }
  dataset(pathParts) {
    return new Dataset(this, pathParts);
  }
  narrative(pathParts) {
    return new Narrative(this, pathParts);
  }
  availableDatasets() {
    return [];
  }
  availableNarratives() {
    return [];
  }

  /* Static access control for this entire source, regardless of any
   * instance-specific parameters.
   */
  static visibleToUser(user) { // eslint-disable-line no-unused-vars
    return true;
  }

  /* Instance-specific access control delegates to the static method by
   * default.
   */
  visibleToUser(user) {
    return this.constructor.visibleToUser(user);
  }

  async getInfo() {
    throw new InvalidSourceImplementation("getInfo() must be implemented by subclasses");
  }
}

class Dataset {
  constructor(source, pathParts) {
    this.source = source;
    this.pathParts = pathParts;

    // Require baseParts, otherwise we have no actual dataset path.  This
    // inspects baseParts because some of the pathParts (above) may not apply,
    // which each Dataset subclass determines for itself.
    if (!this.baseParts.length) {
      throw new NoDatasetPathError();
    }
  }
  get baseParts() {
    return this.pathParts.slice();
  }
  baseNameFor(type) {
    const baseName = this.baseParts.join("_");
    return type === "main"
      ? `${baseName}.json`
      : `${baseName}_${type}.json`;
  }
  urlFor(type) {
    const url = new URL(this.baseNameFor(type), this.source.baseUrl);
    return url.toString();
  }
  get isRequestValidWithoutDataset() {
    return false;
  }
}

class Narrative {
  constructor(source, pathParts) {
    this.source = source;
    this.pathParts = pathParts;
  }
  get baseParts() {
    return this.pathParts.slice();
  }
  get baseName() {
    const baseName = this.baseParts.join("_");
    return `${baseName}.md`;
  }
  url() {
    const url = new URL(this.baseName, this.source.baseUrl);
    return url.toString();
  }
}

class CoreSource extends Source {
  static get _name() { return "core"; }
  get baseUrl() { return "http://data.nextstrain.org/"; }
  get repo() { return "nextstrain/narratives"; }
  get branch() { return "master"; }

  narrative(pathParts) {
    return new CoreNarrative(this, pathParts);
  }

  // The computation of these globals should move here.
  availableDatasets() {
    return global.availableDatasets[this.name] || [];
  }

  async availableNarratives() {
    const qs = queryString.stringify({ref: this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents?${qs}`);

    if (response.status !== 200 && response.status !== 304) {
      utils.warn(`Error fetching available narratives from GitHub for source ${this.name}`, await utils.responseDetails(response));
      return [];
    }

    const files = await response.json();
    return files
      .filter((file) => file.type === "file")
      .filter((file) => file.name !== "README.md")
      .filter((file) => file.name.endsWith(".md"))
      .map((file) => file.name
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
  }
}

class CoreStagingSource extends CoreSource {
  static get _name() { return "staging"; }
  get baseUrl() { return "http://staging.nextstrain.org/"; }
  get repo() { return "nextstrain/narratives"; }
  get branch() { return "staging"; }
}

class CoreNarrative extends Narrative {
  url() {
    const repoBaseUrl = `https://raw.githubusercontent.com/${this.source.repo}/${this.source.branch}/`;
    const url = new URL(this.baseName, repoBaseUrl);
    return url.toString();
  }
}

class CommunitySource extends Source {
  constructor(owner, repoName) {
    super();

    // The GitHub owner and repo names are required.
    if (!owner) throw new Error(`Cannot construct a ${this.constructor.name} without an owner`);
    if (!repoName) throw new Error(`Cannot construct a ${this.constructor.name} without a repoName`);

    this.owner = owner;
    [this.repoName, this.branch] = repoName.split(/@/, 2);

    if (!this.repoName) throw new Error(`Cannot construct a ${this.constructor.name} without a repoName after splitting on /@/`);
    if (!this.branch) {
      this.branch = "master";
    }
  }

  static get _name() { return "community"; }
  get repo() { return `${this.owner}/${this.repoName}`; }
  get baseUrl() { return `https://github.com/${this.repo}/raw/${this.branch}/`; }

  get repoNameWithBranch() {
    return this.branch === "master"
      ? this.repoName
      : `${this.repoName}@${this.branch}`;
  }

  dataset(pathParts) {
    return new CommunityDataset(this, pathParts);
  }
  narrative(pathParts) {
    return new CommunityNarrative(this, pathParts);
  }

  async availableDatasets() {
    const qs = queryString.stringify({ref: this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/auspice?${qs}`);

    if (response.status !== 200 && response.status !== 304) {
      utils.warn(`Error fetching available datasets from GitHub for source ${this.name}`, await utils.responseDetails(response));
      return [];
    }

    const filenames = (await response.json())
      .filter((file) => file.type === "file")
      // remove anything which doesn't start with the repo name, which is required of community datasets
      .filter((file) => file.name.startsWith(this.repoName))
      .map((file) => file.name);
    const pathnames = utils.getDatasetsFromListOfFilenames(filenames)
      // strip out the repo name from the start of the pathnames
      // as CommunityDataset().baseParts will add this in
      .map((pathname) => pathname.replace(`${this.repoName}/`, ""));
    return pathnames;
  }

  async availableNarratives() {
    const qs = queryString.stringify({ref: this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/narratives?${qs}`);

    if (response.status !== 200 && response.status !== 304) {
      if (response.status !== 404) {
        // not found doesn't warrant an error print, it means there are no narratives for this repo
        utils.warn(`Error fetching available narratives from GitHub for source ${this.name}`, await utils.responseDetails(response));
      }
      return [];
    }

    const files = await response.json();
    return files
      .filter((file) => file.type === "file")
      .filter((file) => file.name !== "README.md")
      .filter((file) => file.name.endsWith(".md"))
      .filter((file) => file.name.startsWith(this.repoName))
      .map((file) => file.name
        .replace(this.repoName, "")
        .replace(/^_/, "")
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
  }
  async getInfo() {
    /* could attempt to fetch a certain file from the repository if we want to implement
    this functionality in the future */
    const githubUrl = `https://github.com/${this.owner}/${this.repoName}/tree/${this.branch}`;
    return {
      title: `${this.owner}'s "${this.repoName}" Nextstrain community build`,
      byline: `
        Nextstrain community builds are fetched directly from GitHub
        repositories, in this case ${githubUrl}.  The available datasets and
        narratives in this repository are listed below.
      `,
      website: null,
      showDatasets: true,
      showNarratives: true,
      /* avatar could be fetched here & sent in base64 or similar, or a link sent. The former (or similar) has the advantage
      of private S3 buckets working, else the client will have to make (a) an authenticated request (too much work)
      or (b) a subsequent request to nextstrain.org/charon (why not do it at once?) */
      avatar: `https://github.com/${this.owner}.png?size=200`
    };
  }
}

class CommunityDataset extends Dataset {
  get baseParts() {
    // We require datasets are in the auspice/ directory and include the repo
    // name in the file basename.
    return [`auspice/${this.source.repoName}`, ...this.pathParts];
  }
  get isRequestValidWithoutDataset() {
    if (!this.pathParts.length) {
      return true;
    }
    return false;
  }
}

class CommunityNarrative extends Narrative {
  get baseParts() {
    // We require narratives are in the narratives/ directory and include the
    // repo name in the file basename.
    return [`narratives/${this.source.repoName}`, ...this.pathParts];
  }
}


class UrlDefinedSource extends Source {

  static get _name() { return "urlDefined"; }
  get baseUrl() {
    throw new Error("UrlDefinedSource does not use `this.baseUrl`");
  }

  dataset(pathParts) {
    return new UrlDefinedDataset(this, pathParts);
  }
  narrative(pathParts) {
    return new UrlDefinedNarrative(this, pathParts);
  }

  // available datasets & narratives are unknown when the dataset is specified by the URL
  async availableDatasets() { return []; }
  async availableNarratives() { return []; }
  async getInfo() { return {}; }
}

class UrlDefinedDataset extends Dataset {
  get baseParts() {
    return this.pathParts;
  }
  get isRequestValidWithoutDataset() {
    return false;
  }
  baseNameFor(type) {
    // mandate https
    const datasetUrl = "https://" + this.baseParts.join("/");
    if (type==="main") {
      return datasetUrl;
    }
    // if the request is for A.json, then return A_<type>.json.
    if (datasetUrl.endsWith(".json")) {
      return `${datasetUrl.replace(/\.json$/, '')}_${type}.json`;
    }
    // if the request if for B, where B doesn't end with `.json`, then return B_<type>
    return `${datasetUrl}_${type}`;
  }
  urlFor(type) {
    // when `parsePrefix()` runs (which it does for each /charon/getDataset API request), it preemtively defines
    // a `urlFor` tree, meta and main types. For `UrlDefinedDataset`s we can only serve v2 datasets, but be aware
    // the `urlFor` function is still called for tree + meta "types".
    if (type==="tree" || type==="meta") return undefined;
    const url = new URL(this.baseNameFor(type));
    return url.toString();
  }
}

class UrlDefinedNarrative extends Narrative {
  get baseParts() {
    return this.pathParts;
  }
  get baseName() {
    // mandate https
    return "https://" + this.baseParts.join("/");
  }
  url() {
    const url = new URL(this.baseName);
    return url.toString();
  }
}

class S3Source extends Source {
  get bucket() {
    throw new InvalidSourceImplementation("bucket() must be implemented by subclasses");
  }
  get baseUrl() {
    return `https://${this.bucket}.s3.amazonaws.com`;
  }
  async _listObjects() {
    return new Promise((resolve, reject) => {
      let contents = [];
      S3.listObjectsV2({Bucket: this.bucket}).eachPage((err, data, done) => {
        if (err) {
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
  async getAndDecompressObject(key) {
    const object = await S3.getObject({ Bucket: this.bucket, Key: key}).promise();
    if (object.ContentEncoding === 'gzip') {
      object.Body = zlib.gunzipSync(object.Body);
    }
    return object.Body;
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
      const objects = await this._listObjects();
      const objectKeys = objects.map((object) => object.Key);

      let logoSrc;
      if (objectKeys.includes("group-logo.png")) {
        // Use pre-signed URL to allow client to fetch from private S3 bucket
        logoSrc = S3.getSignedUrl('getObject', {Bucket: this.bucket, Key: "group-logo.png"});
      }

      let title = `"${this.name}" Nextstrain group`;
      let byline = `The available datasets and narratives in this group are listed below.`;
      let website = null;
      let showDatasets = true;
      let showNarratives = true;
      let overview;
      if (objectKeys.includes("group-overview.md")) {
        const overviewContent = await this.getAndDecompressObject("group-overview.md");
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
        title: `"${this.name}" Nextstrain group`,
        byline: `The available datasets and narratives in this group are listed below.`,
        website: null,
        showDatasets: true,
        showNarratives: true,
        error: `Error in custom group info: ${err.message}`
      };
    }
  }
}

class PrivateS3Source extends S3Source {
  dataset(pathParts) {
    return new PrivateS3Dataset(this, pathParts);
  }
  narrative(pathParts) {
    return new PrivateS3Narrative(this, pathParts);
  }
  static visibleToUser(user) { // eslint-disable-line no-unused-vars
    throw new InvalidSourceImplementation("visibleToUser() must be implemented explicitly by subclasses (not inherited from PrivateS3Source)");
  }
}

class PrivateS3Dataset extends Dataset {
  urlFor(type) {
    return S3.getSignedUrl("getObject", {
      Bucket: this.source.bucket,
      Key: this.baseNameFor(type)
    });
  }
}

class PrivateS3Narrative extends Narrative {
  url() {
    return S3.getSignedUrl("getObject", {
      Bucket: this.source.bucket,
      Key: this.baseName
    });
  }
}

class PublicGroupSource extends S3Source {
  get bucket() { return `nextstrain-${this.name}`; }
  static isGroup() {
    return true;
  }
}

class PrivateGroupSource extends PrivateS3Source {
  get bucket() { return `nextstrain-${this.name}`; }

  static visibleToUser(user) {
    return !!user && !!user.groups && user.groups.includes(this._name);
  }
  static isGroup() {
    return true;
  }
}

class BlabSource extends PublicGroupSource {
  static get _name() { return "blab"; }
}

class BlabPrivateSource extends PrivateGroupSource {
  static get _name() { return "blab-private"; }
}

class InrbDrcSource extends PrivateGroupSource {
  /* Person to contact for enquiries: Alli Black / James Hadfield */
  static get _name() { return "inrb-drc"; }

  // INRB's bucket is named differently due to early adoption
  get bucket() { return "nextstrain-inrb"; }
}

class NzCovid19PrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: James Hadfield */
  static get _name() { return "nz-covid19-private"; }
}

class AllWalesPrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: James Hadfield */
  static get _name() { return "allwales-private"; }
}

class NextspainSource extends PublicGroupSource {
  /* Person to contact for enquiries: James Hadfield */
  static get _name() { return "nextspain"; }
}

class SeattleFluSource extends PublicGroupSource {
  static get _name() { return "seattleflu"; }
}

class SwissSource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard Neher / Emma Hodcroft */
  static get _name() { return "swiss"; }
}

class COGUKSource extends PublicGroupSource {
  /* Person to contact for enquiries: Trevor / Emma / James */
  static get _name() { return "cog-uk"; }
}

class NGSSASource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard Neher / Emma Hodcroft */
  static get _name() { return "ngs-sa"; }
}

class ECDCSource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard Neher / Emma Hodcroft */
  static get _name() { return "ecdc"; }
}

class IllinoisGagnonPublicSource extends PublicGroupSource {
  /* Person to contact for enquiries: Thomas Sibley */
  static get _name() { return "illinois-gagnon-public"; }
}

class IllinoisGagnonPrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: Thomas Sibley */
  static get _name() { return "illinois-gagnon-private"; }
}

class GrubaughLabPrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: James */
  static get _name() { return "grubaughlab"; }
}

class NeherLabSource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard */
  static get _name() { return "neherlab"; }
}

class SpheresSource extends PublicGroupSource {
  /* Person to contaect for enquiries: Trevor */
  static get _name() { return "spheres"; }
}

const sources = [
  CoreSource,
  CoreStagingSource,
  CommunitySource,
  UrlDefinedSource,
  /* Public nextstrain groups: */
  BlabSource,
  SeattleFluSource,
  NextspainSource,
  SwissSource,
  COGUKSource,
  NGSSASource,
  ECDCSource,
  IllinoisGagnonPublicSource,
  NeherLabSource,
  SpheresSource,
  /* Private nextstain groups: */
  BlabPrivateSource,
  NzCovid19PrivateSource,
  AllWalesPrivateSource,
  IllinoisGagnonPrivateSource,
  GrubaughLabPrivateSource,
  InrbDrcSource
];

const sourceMap = new Map(sources.map(s => [s._name, s]));
utils.verbose("Sources are:", sourceMap);

module.exports = sourceMap;
