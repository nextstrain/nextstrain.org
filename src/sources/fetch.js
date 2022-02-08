/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
const authz = require("../authz");
const {Source, Dataset, DatasetSubresource, Narrative, NarrativeSubresource} = require("./models");

class UrlDefinedSource extends Source {
  constructor(authority) {
    super();

    if (!authority) throw new Error(`Cannot construct a ${this.constructor.name} without a URL authority`);

    this.authority = authority;
  }

  async baseUrl() {
    return `https://${this.authority}`;
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

  get authzPolicy() {
    return [
      {tag: authz.tags.Visibility.Public, role: "*", allow: [authz.actions.Read]},
    ];
  }
  get authzTags() {
    return new Set([
      authz.tags.Type.Source,
      authz.tags.Visibility.Public,
    ]);
  }
  get authzTagsToPropagate() {
    return new Set([
      authz.tags.Visibility.Public,
    ]);
  }
}

class UrlDefinedDataset extends Dataset {
  get baseName() {
    return this.baseParts.join("/");
  }
  subresource(type) {
    return new UrlDefinedDatasetSubresource(this, type);
  }
  async exists() {
    /* Assume existence.  There's little benefit to checking with extra
     * requests when we don't have a natural fallback page (e.g. the Group page
     * or Community page) and checking means that AWS S3 signed URLs can't be
     * used with /fetch since they dictate a single action (i.e. can't work for
     * both HEAD and GET).
     *   -trs, 2 Feb 2022
     */
    return true;
  }
}

class UrlDefinedDatasetSubresource extends DatasetSubresource {
  get baseName() {
    const type = this.type;
    const baseName = this.resource.baseName;

    if (type === "main") {
      return baseName;
    }

    return baseName.endsWith(".json")
      ? `${baseName.replace(/\.json$/, '')}_${type}.json`
      : `${baseName}_${type}`;
  }
}

class UrlDefinedNarrative extends Narrative {
  get baseName() {
    return this.baseParts.join("/");
  }
  subresource(type) {
    return new UrlDefinedNarrativeSubresource(this, type);
  }
  async exists() {
    /* Assume existence.  There's little benefit to checking with extra
     * requests when we don't have a natural fallback page (e.g. the Group page
     * or Community page) and checking means that AWS S3 signed URLs can't be
     * used with /fetch since they dictate a single action (i.e. can't work for
     * both HEAD and GET).
     *   -trs, 2 Feb 2022
     */
    return true;
  }
}

class UrlDefinedNarrativeSubresource extends NarrativeSubresource {
  get baseName() {
    return this.resource.baseName;
  }
}

module.exports = {
  UrlDefinedSource,
};
