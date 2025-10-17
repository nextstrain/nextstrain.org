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

  /*
  set pathParts(pathParts) {
    // XXX FIXME comment on this
    if (pathParts[0] === NEXTSTRAIN_COLLECTION_ID)
      pathParts = pathParts.slice(1);

    super.pathParts = pathParts;
  }
  get pathParts() {
    return super.pathParts;
  }
  */

  // eslint-disable-next-line no-unused-vars
  assertValidPathParts(pathParts) {
    // Override check for underscores (_), as we want to allow Nextclade
    // dataset paths that include them.  There is no risk of "confused deputy"
    // problems as this is a read-only source with fixed datasets from an
    // index.
  }

  /*
  get baseParts() {
    // XXX FIXME: handle the index's collections concept at our Source level
    // instead? e.g. new NextcladeSource("nextstrain") and new
    // NextcladeSource("community")?
    //
    // but that complicates things in src/utils/prefix.js
    return this.pathParts.length && this.pathParts[0] !== "community"
      ? ["nextstrain", ...this.pathParts]
      : [...this.pathParts];
  }
  */

  get baseName() {
    return this.baseParts.join("/");
  }

  // XXX FIXME: resolve shortcuts from index, plus names with leading "nextstrain/"
  /*
  resolve() {
    /* XXX TODO: Reimplement this in terms of methods on the source, not by
     * breaking encapsulation by using a process-wide global.
     *   -trs, 26 Oct 2021 (based on a similar comment 5 Sept 2019)
     *//*
    const sourceName = this.source.name;
    const prefixParts = this.pathParts;

    if (!global.availableDatasets[sourceName]) {
      utils.verbose("Can't compare against available datasets as there are none!");
      return this;
    }

    const doesPathExist = (pathToCheck) =>
      global.availableDatasets[sourceName]
        .includes(pathToCheck);

    const prefix = prefixParts.join("/");

    if (doesPathExist(prefix)) {
      return this;
    }

    /* if we are here, then the path doesn't match any available datasets exactly *//*
    const nextDefaultPart = global.availableDatasets.defaults[sourceName][prefix];

    if (nextDefaultPart) {
      const dataset = new this.constructor(this.source, [...prefixParts, nextDefaultPart], this.versionDescriptor);
      return dataset.resolve();
    }

    return this;
  }
  */

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
