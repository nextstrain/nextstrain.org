import { strict as assert } from 'assert';

import * as authz from '../authz/index.js';
import { fetch } from '../fetch.js';
import { NotFound } from '../httpErrors.js';
import { re } from '../templateLiterals.js';
import { Source, Dataset, DatasetSubresource } from './models.js';

// XXX FIXME comment on this
const NEXTSTRAIN_COLLECTION_ID = "nextstrain";

export class NextcladeSource extends Source {
  get name() { return "nextclade"; }
  async baseUrl() { return "https://data.clades.nextstrain.org/v3/"; }

  async index() {
    /* Source instances are constructed for each request, so this
     * instance-local cache results in one index fetch per request.  The
     * fetch()-level HTTP caching results in conditional fetches to the
     * upstream that mostly return as 304 Not Modified.  This seems Fine, at
     * least For Now.
     *   -trs, 16 Oct 2025
     */
    return this._index ??= await (await fetch(await this.urlFor("index.json"), {cache: "no-cache"})).json();
  }

  dataset(pathParts, versionDescriptor) {
    return new NextcladeDataset(this, pathParts, versionDescriptor);
  }

  async availableDatasets() {
    return (await this.index())
      .collections
      .flatMap(c => c.datasets)
      .filter(d => d.files.treeJson)
      .map(d => d.path.replace(re`^${NEXTSTRAIN_COLLECTION_ID}/`, ""));
  }

  async getInfo() {
    return {
      title: "Nextclade reference dataset trees",
      showDatasets: true,
      showNarratives: false,
    };
  }

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

class NextcladeDataset extends Dataset {
  static get Subresource() {
    return NextcladeDatasetSubresource;
  }

  // eslint-disable-next-line no-unused-vars
  assertValidPathParts(pathParts) {
    // Override check for underscores (_), as we want to allow Nextclade
    // dataset paths that include them.  There is no risk of "confused deputy"
    // problems as this source 1) only allows fixed datasets from an index and
    // 2) uses slashes (/) not underscores (_) when joining path parts.
  }
  get baseParts() {
    return this.pathParts.slice();
  }
  get baseName() {
    return this.baseParts.join("/");
  }

  async resolve() {
    if (this.pathParts[0] === NEXTSTRAIN_COLLECTION_ID) {
      const dataset = new this.constructor(this.source, this.pathParts.slice(1), this.versionDescriptor);
      return await dataset.resolve();
    }

    // XXX FIXME shortcuts

    return this;
  }

  // XXX FIXME: resolve using versions in index
  /*
  versionInfo(versionDescriptor) {
    if (!versionDescriptor)
      return [null, undefined];

    const versions = new ResourceVersions(this.source.name, 'dataset', this.pathParts.join("/"));
    const versionDate = versions.versionDateFromDescriptor(this.versionDescriptor);
    const versionUrls = versionDate ? versions.subresourceUrls(versionDate) : undefined
    return [versionDate, versionUrls];
  }
  */
}


class NextcladeDatasetSubresource extends DatasetSubresource {
  static validTypes = ["main"];

  async url() {
    // XXX FIXME: comment on this implicit fetch and caching
    const index = await this.resource.source.index();
    const collectionIds = new Set(
      index
        .collections
        .map(c => c.meta.id)
    );
    assert(collectionIds.has(NEXTSTRAIN_COLLECTION_ID));

    const datasetPath =
      collectionIds.has(this.resource.baseParts[0])
        ? this.resource.baseName
        : `${NEXTSTRAIN_COLLECTION_ID}/${this.resource.baseName}`;

    const indexed =
      index
        .collections
        .flatMap(c => c.datasets)
        .find(d => d.path === datasetPath);

    if (!indexed)
      throw new NotFound(`Dataset '${datasetPath}' is not in Nextclade's index`);

    // XXX FIXME: versions: this.resource.versionDescriptor
    return await this.resource.source.urlFor([indexed.path, indexed.version.tag, indexed.files.treeJson].join("/"));
  }
}
