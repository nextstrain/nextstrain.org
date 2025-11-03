import * as authz from '../authz/index.js';
import { fetch } from '../fetch.js';
import { NotFound } from '../httpErrors.js';
import { ResourceVersions } from '../resourceIndex.js';
import { re } from '../templateLiterals.js';
import { Source, Dataset, DatasetSubresource } from './models.js';

// We privilege our own collection since this is our site
const NEXTSTRAIN_COLLECTION_ID = "nextstrain";
const NEXTSTRAIN_COLLECTION_PREFIX = re`^${NEXTSTRAIN_COLLECTION_ID}/`;

/* We hardcode what collections to expose so that adding a new collection
 * upstream in Nextclade's index doesn't automatically and unexpectedly expose
 * it here too.  The idea is that we should opt-in knowingly by adding the new
 * collection here and testing things work.  This hardcoding also lets us
 * implement the NextcladeDataset.baseName getter without an additional async
 * lookup operation.
 *   -trs, 3 Nov 2025
 */
const COLLECTION_IDS = new Set([NEXTSTRAIN_COLLECTION_ID, "community"]);


/**
 * Nextclade dataset reference trees.
 *
 * Decisions we made about behaviour:
 *
 *   • Drop the leading nextstrain/ from dataset names, but accept it as an
 *     alias by redirecting, e.g.
 *
 *         https://nextstrain.org/nextclade/nextstrain/mpox/clade-iib
 *       → https://nextstrain.org/nextclade/mpox/clade-iib
 *
 *   • Accept the index's shortcut names, but expand them by redirection to the
 *     canonical name, e.g.
 *
 *         https://nextstrain.org/nextclade/hMPXV
 *       → https://nextstrain.org/nextclade/mpox/clade-iib
 *
 *     Some shortcuts have "_" in their name (e.g. flu_h1n1pdm_na); accept
 *     those both as-is and with s{_}{/}g applied (e.g. flu/h1n1pdm/na).
 *
 *   • Prefer full names (minus leading nextstrain/) as the canonical name
 *
 * See also <https://github.com/nextstrain/nextstrain.org/issues/1156>.
 *
 * The convention in this file is that underscored names are used for
 * extensions to the sources models and private fields are used for internal
 * data.  This helps keep clear what's part of the sources interface and what's
 * not.
 */
export class NextcladeSource extends Source {
  #index;
  #indexDatasets;

  /* This constructor param is only used by the resourceIndexer/ code when
   * loading the Nextclade index from disk instead of the network.
   */
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
    return (await this._indexDatasets())
      .map(({path}) => path.replace(NEXTSTRAIN_COLLECTION_PREFIX, ""));
  }

  async _datasetAliases() {
    return new Map(
      (await this._indexDatasets())
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

  async _indexDatasets() {
    return this.#indexDatasets ??=
      (await this._index())
        .collections
        .filter(c => COLLECTION_IDS.has(c.meta.id))
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
    const explicitCollections = new Set(
      Array.from(COLLECTION_IDS)
        .filter(id => id !== NEXTSTRAIN_COLLECTION_ID)
    );

    return explicitCollections.has(this.baseParts[0])
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

  versionInfo() {
    /* Copied wholesale from src/sources/core.js.  This is part of the tension
     * between the Source/Resource/Subresource framework and the
     * resourceIndexer/ResourceVersions/ListResources framework.
     *   -trs, 23 Oct 2025
     */
    if (!this.versionDescriptor) {
      return [null, undefined];
    }

    const versions = new ResourceVersions(this.source.name, 'dataset', this.pathParts.join("/"));
    const versionDate = versions.versionDateFromDescriptor(this.versionDescriptor);
    const versionUrls = versionDate ? versions.subresourceUrls(versionDate) : undefined
    return [versionDate, versionUrls];
  }

  async _indexDataset() {
    /* XXX TODO: Consider making this resolve this.versionDescriptor to a
     * specific version and returning the fetched pathogen.json for that
     * version.
     *
     * This would be most appropriate in the case of abandoning the bolted-on
     * versionInfo() method for version resolution that's more integrated into
     * the Source/Resource/Subresource framework instead of done completely
     * separately.
     *   -trs, 3 Nov 2025
     */
    return (await this.source._indexDatasets())
      .find(d => d.path === this.baseName);
  }
}


class NextcladeDatasetSubresource extends DatasetSubresource {
  constructor(resource, type) {
    super(resource, type);

    if (this.type !== "main")
      throw new NotFound(`Nextclade datasets do not provide a '${this.type}' sidecar`);
  }

  async baseName() {
    /* Note that this method ignores this.resource.versionDescriptor because
     * it's not expected to be called if that property has a value; it expects
     * that its caller, the Subresource.url() method, will instead go thru the
     * this.resource.versionInfo() code path in that case.  See also the
     * comment in ._indexDataset() above.
     *   -trs, 3 Nov 2025
     */
    const indexed = await this.resource._indexDataset();

    if (!indexed)
      throw new NotFound(`Dataset '${this.resource.baseName}' is not in Nextclade's index (or does not have a tree)`);

    /* The version tag here is the "latest" version of the dataset.  See also
     * <https://bedfordlab.slack.com/archives/C01LCTT7JNN/p1761154424437499>.
     *   -trs, 3 Nov 2025
     */
    return `${indexed.path}/${indexed.version.tag}/${indexed.files.treeJson}`;
  }
}
