const AWS = require("aws-sdk");
const fetch = require("node-fetch");
const queryString = require("query-string");
const {NoDatasetPathError} = require("./exceptions");
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
  get name() {
    throw "name() must be implemented by subclasses";
  }
  get baseUrl() {
    throw "baseUrl() must be implemented by subclasses";
  }
  dataset(pathParts) {
    return new Dataset(this, pathParts);
  }
  narrative(pathParts) {
    return new Narrative(this, pathParts);
  }
  visibleToUser(user) {
    return true;
  }
  availableDatasets() {
    return [];
  }
  availableNarratives() {
    return [];
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
    return `${baseName}_${type}.json`;
  }
  urlFor(type) {
    const url = new URL(this.baseNameFor(type), this.source.baseUrl);
    return url.toString();
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

class LiveSource extends Source {
  get name() { return "live" }
  get baseUrl() { return "http://data.nextstrain.org/" }
  get repo() { return "nextstrain/narratives" }
  get branch() { return "master" }

  narrative(pathParts) {
    return new LiveNarrative(this, pathParts);
  }

  // The computation of these globals should move here.
  availableDatasets() {
    return global.availableDatasets[this.name] || [];
  }

  async availableNarratives() {
    const qs = queryString.stringify({ref: this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents?${qs}`);

    if (!response.ok) {
      utils.warn(`Error fetching available narratives from GitHub for source ${this.name}`);
      return [];
    }

    const files = await response.json();
    return files
      .filter(file => file.type === "file")
      .filter(file => file.name !== "README.md")
      .filter(file => file.name.endsWith(".md"))
      .map(file => file.name
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
  }
}

class StagingSource extends LiveSource {
  get name() { return "staging" }
  get baseUrl() { return "http://staging.nextstrain.org/" }
  get repo() { return "nextstrain/narratives" }
  get branch() { return "staging" }
}

class LiveNarrative extends Narrative {
  url() {
    const repoBaseUrl = `https://raw.githubusercontent.com/${this.source.repo}/${this.source.branch}/`;
    const url = new URL(this.baseName, repoBaseUrl);
    return url.toString();
  }
}

class CommunitySource extends Source {
  get name() { return "community" }
  dataset(pathParts) {
    return new CommunityDataset(this, pathParts);
  }
  narrative(pathParts) {
    return new CommunityNarrative(this, pathParts);
  }
}

class CommunityDataset extends Dataset {
  get baseParts() {
    // First part is the GitHub user/org.  The repo name is the second part,
    // which we also expect in the file basename.
    return this.pathParts.slice(1);
  }
  urlFor(type) {
    const repoBaseUrl = `https://raw.githubusercontent.com/${this.pathParts[0]}/${this.pathParts[1]}/master/auspice/`;
    const url = new URL(this.baseNameFor(type), repoBaseUrl);
    return url.toString();
  }
}

class CommunityNarrative extends Narrative {
  get baseParts() {
    // First part is the GitHub user/org.  The repo name is the second part,
    // which we also expect in the file basename.
    return this.pathParts.slice(1);
  }
  url() {
    const repoBaseUrl = `https://raw.githubusercontent.com/${this.pathParts[0]}/${this.pathParts[1]}/master/narratives/`;
    const url = new URL(this.baseName, repoBaseUrl);
    return url.toString();
  }
}

class PrivateS3Source extends Source {
  dataset(pathParts) {
    return new PrivateS3Dataset(this, pathParts);
  }
  narrative(pathParts) {
    return new PrivateS3Narrative(this, pathParts);
  }
  visibleToUser(user) {
    throw "visibleToUser() must be implemented explicitly by subclasses (not inherited from Source)";
  }
  async _listObjects() {
    // XXX TODO: This will only return the first 1000 objects.  That's fine for
    // now (for comparison, nextstrain-data only has ~500), but we really
    // should iterate over the whole bucket contents using the S3 client's
    // pagination support.
    //   -trs, 30 Aug 2019
    const list = await S3.listObjectsV2({Bucket: this.bucket}).promise();
    return list.Contents;
  }
  async availableDatasets() {
    // Walking logic borrowed from auspice's cli/server/getAvailable.js
    const objects = await this._listObjects();
    return objects
      .map(object => object.Key)
      .filter(file => file.endsWith("_tree.json"))
      .map(file => file
        .replace(/_tree[.]json$/, "")
        .split("_")
        .join("/"));
  }
  async availableNarratives() {
    // Walking logic borrowed from auspice's cli/server/getAvailable.js
    const objects = await this._listObjects();
    return objects
      .map(object => object.Key)
      .filter(file => file.endsWith(".md"))
      .map(file => file
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
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

class InrbDrcSource extends PrivateS3Source {
  get name() { return "inrb-drc" }
  get bucket() { return "nextstrain-inrb" }

  visibleToUser(user) {
    return !!user && !!user.groups && user.groups.includes("inrb");
  }
}

module.exports = new Map([
  ["live", new LiveSource()],
  ["staging", new StagingSource()],
  ["community", new CommunitySource()],
  ["inrb-drc", new InrbDrcSource()],
]);
