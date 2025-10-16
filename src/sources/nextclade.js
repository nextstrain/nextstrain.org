import * as authz from '../authz/index.js';

import { fetch } from '../fetch.js';
import { Source, Dataset, DatasetSubresource } from './models.js';

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
    // XXX FIXME: calculated from index
    return [];
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
  get baseParts() {
    // XXX FIXME: handle the index's collections concept at our Source level
    // instead? e.g. new NextcladeSource("nextstrain") and new
    // NextcladeSource("community")?
    return this.pathParts.length && this.pathParts[0] !== "community"
      ? ["nextstrain", ...this.pathParts]
      : [...this.pathParts];
  }
  */

  get baseName() {
    return this.baseParts.join("/");
  }

  async index() {
    return this._index ??=
      (await this.source.index())
        .collections
        .flatMap(c => c.datasets)
        .find(d => d.path === this.baseName);
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
    // XXX FIXME: versions: this.resource.versionDescriptor
    const versionTag = (await this.resource.index()).version.tag;
    return await this.resource.source.urlFor(`${this.resource.baseName}/${versionTag}/tree.json`);
  }
}
