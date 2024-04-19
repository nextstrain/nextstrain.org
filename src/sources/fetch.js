import * as authz from '../authz/index.js';

import { Source, Dataset, DatasetSubresource, Narrative, NarrativeSubresource } from './models.js';

class UrlDefinedSource extends Source {
  constructor(authority) {
    super();

    if (!authority) throw new Error(`Cannot construct a ${this.constructor.name} without a URL authority`);

    this.authority = authority;
  }

  async baseUrl() {
    return `https://${this.authority}`;
  }

  dataset(pathParts, versionDescriptor) {
    return new UrlDefinedDataset(this, pathParts, versionDescriptor);
  }
  narrative(pathParts, versionDescriptor) {
    return new UrlDefinedNarrative(this, pathParts, versionDescriptor);
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
  // eslint-disable-next-line no-unused-vars
  assertValidPathParts(pathParts) {
    // Override check for underscores (_), as we want to allow arbitrary
    // external URLs.
  }
  versionInfo() {
    /* Version descriptors make no sense for fetch sources, but our routing approach always extracts them */
    return [null, undefined];
  }
  get baseName() {
    /**
     * The baseName includes anything that looks like a version descriptor.
     * Minor bug: If the requested URL ends with a '@' then it'll be dropped here.
     */
    const version = this.versionDescriptor ? `@${this.versionDescriptor}` : ""
    return this.baseParts.join("/") + version;
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
  // eslint-disable-next-line no-unused-vars
  assertValidPathParts(pathParts) {
    // Override check for underscores (_), as we want to allow arbitrary
    // external URLs.
  }
  versionInfo() {
    /* Version descriptors make no sense for fetch sources, but our routing approach always extracts them */
    return [null, undefined];
  }
  get baseName() {
    /* see comment in UrlDefinedDataset */
    const version = this.versionDescriptor ? `@${this.versionDescriptor}` : ""
    return this.baseParts.join("/") + version;
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

export {
  UrlDefinedSource,
};
