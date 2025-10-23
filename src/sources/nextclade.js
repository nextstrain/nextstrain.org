import { strict as assert } from 'assert';
import { DateTime } from 'luxon';

import * as authz from '../authz/index.js';
import { fetch } from '../fetch.js';
import { BadRequest, NotFound } from '../httpErrors.js';
import { re } from '../templateLiterals.js';
import { Source, Dataset, DatasetSubresource } from './models.js';

// XXX FIXME comment on this
const NEXTSTRAIN_COLLECTION_ID = "nextstrain";
const NEXTSTRAIN_COLLECTION_PREFIX = re`^${NEXTSTRAIN_COLLECTION_ID}/`;

/**
 * XXX FIXME
 * 
Drop the leading nextstrain/ from dataset names, but accept it as an alias by redirecting (e.g. https://nextstrain.org/nextclade/nextstrain/mpox/clade-iib → https://nextstrain.org/nextclade/mpox/clade-iib).
Accept the index's shortcut names, but expand them by redirection to the canonical name (e.g. https://nextstrain.org/nextclade/hMPXV → https://nextstrain.org/nextclade/mpox/clade-iib). Some shortcuts have _ in their name (e.g. flu_h1n1pdm_na); accept those both as-is and with s{_}{/}g applied (e.g. flu/h1n1pdm/na).
Prefer full names (minus leading nextstrain/) as the canonical name
 * <https://github.com/nextstrain/nextstrain.org/issues/1156>
 */
export class NextcladeSource extends Source {
  /* XXX FIXME */
  constructor(index) {
    super();
    if (index)
      this.#index = index;
  }

  get name() { return "nextclade"; }
  async baseUrl() { return "https://data.clades.nextstrain.org/v3/"; }

  async _index() {
    /* Source instances are constructed for each request, so this
     * instance-local cache results in one index fetch per request.  The
     * fetch()-level HTTP caching results in conditional fetches to the
     * upstream that mostly return as 304 Not Modified.  This seems Fine, at
     * least For Now.
     *   -trs, 16 Oct 2025
     */
    return this.#index ??= await (await fetch(await this.urlFor("index.json"), {cache: "no-cache"})).json();
  }

  dataset(pathParts, versionDescriptor) {
    return new NextcladeDataset(this, pathParts, versionDescriptor);
  }

  async availableDatasets() {
    return (await this._datasetsWithTrees())
      .map(({path}) => path.replace(NEXTSTRAIN_COLLECTION_PREFIX, ""));
  }

  async _datasetAliases() {
    return new Map(
      (await this._datasetsWithTrees())
        .flatMap(({path, shortcuts}) => [
          /* Canonicalize nextstrain/a/b/c → a/b/c since we're on nextstrain.org
           * after all.
           */
          [path, path.replace(NEXTSTRAIN_COLLECTION_PREFIX, "")],

          /* Include index-defined shortcuts under the permutations of a)
           * removing the leading "nextstrain/" and b) replacing underscores (_)
           * with slashes (/).  Spell out all permutations so an
           * iterative/recursive alias resolution is not necessary.
           */
          ...((shortcuts ?? []).flatMap(shortcut => [
            [
              shortcut
                .replace(NEXTSTRAIN_COLLECTION_PREFIX, "")
                .replace(/_/g, "/"),
              path.replace(NEXTSTRAIN_COLLECTION_PREFIX, "")
            ],
            [
              shortcut
                .replace(NEXTSTRAIN_COLLECTION_PREFIX, ""),
              path.replace(NEXTSTRAIN_COLLECTION_PREFIX, "")
            ],
            [
              shortcut
                .replace(/_/g, "/"),
              path.replace(NEXTSTRAIN_COLLECTION_PREFIX, "")
            ],
            [
              shortcut,
              path.replace(NEXTSTRAIN_COLLECTION_PREFIX, "")
            ],
          ])),
        ])
        .filter(([alias, path]) => alias !== path)
    );
  }

  async _datasetsWithTrees() {
    return (await this._index())
      .collections
      .flatMap(c => c.datasets)
      .filter(d => d.files.treeJson);
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

  constructor(source, pathParts, versionDescriptor) {
    super(source, pathParts, versionDescriptor);

    if (this.versionDescriptor && !this.versionDescriptor.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new BadRequest(`Requested version must be in YYYY-MM-DD format (version descriptor requested: "${this.versionDescriptor}")`);
    }
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
  async baseName() {
    const collectionIds = new Set(
      (await this.source._index())
        .collections
        .map(c => c.meta.id)
    );
    assert(collectionIds.has(NEXTSTRAIN_COLLECTION_ID));

    return collectionIds.has(this.baseParts[0])
      ? this.baseParts.join("/")
      : `${NEXTSTRAIN_COLLECTION_ID}/${this.baseParts.join("/")}`;
  }

  async resolve() {
    /* Resolve using a complete and static map of aliases for all paths we
     * support.  This avoids the need for recursive resolving like other
     * sources which dynamically determine supported aliases.
     */
    const aliases = await this.source._datasetAliases();

    const resolvedPath = aliases.get(this.pathParts.join("/"));
    if (resolvedPath)
      return new this.constructor(this.source, resolvedPath.split("/"), this.versionDescriptor);

    return this;
  }

  // XXX FIXME: resolve using versions in index
  /*
  versionInfo() {
    if (!this.versionDescriptor)
      return [null, undefined];

    const versions = new ResourceVersions(this.source.name, 'dataset', this.pathParts.join("/"));
    const versionDate = versions.versionDateFromDescriptor(this.versionDescriptor);
    const versionUrls = versionDate ? versions.subresourceUrls(versionDate) : undefined
    return [versionDate, versionUrls];
  }
  */

  // XXX FIXME: specific to this source
  async _indexed() {
    const baseName = await this.baseName();
    const indexed =
      (await this.source._index())
        .collections
        .flatMap(c => c.datasets)
        .find(d => d.path === baseName);

    if (!indexed)
      throw new NotFound(`Dataset '${baseName}' is not in Nextclade's index`);

    // XXX FIXME: this.versionDescriptor
    return indexed;
  }
}


class NextcladeDatasetSubresource extends DatasetSubresource {
  constructor(resource, type) {
    super(resource, type);

    if (this.type !== "main")
      throw new NotFound(`Nextclade datasets do not provide a '${this.type}' sidecar`);
  }

  async baseName() {
    const indexed = await this.resource._indexed();
    const baseName = await this.resource.baseName();
    return `${baseName}/${indexed.files.treeJson}`;
  }
}
