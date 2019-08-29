/* These Source and Dataset classes contain information to map an array of
 * dataset path parts onto a URL.  Source selection and dataset path aliasing
 * (/flu → /flu/seasonal/h3n2/ha/3y) is handled in
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

class LiveSource extends Source {
  get name() { return "live" }
  get baseUrl() { return "http://data.nextstrain.org/" }

  // The computation of these globals should move here.
  availableDatasets() {
    return global.availableDatasets[this.name] || [];
  }
  availableNarratives() {
    return global.availableNarratives[this.name] || [];
  }
}

class StagingSource extends Source {
  get name() { return "staging" }
  get baseUrl() { return "http://staging.nextstrain.org/" }

  // The computation of these globals should move here.
  availableDatasets() {
    return global.availableDatasets[this.name] || [];
  }
  availableNarratives() {
    return global.availableNarratives[this.name] || [];
  }
}

class CommunitySource extends Source {
  get name() { return "community" }
  dataset(pathParts) {
    return new CommunityDataset(this, pathParts);
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

module.exports = new Map([
  ["live", new LiveSource()],
  ["staging", new StagingSource()],
  ["community", new CommunitySource()],
]);
