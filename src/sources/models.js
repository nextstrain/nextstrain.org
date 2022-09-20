/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
import authzTags from '../authz/tags.js';

import { fetch } from '../fetch.js';

/* The model classes here are the base classes for the classes defined in
 * ./core.js, ./community.js, ./groups.js, etc.
 *
 * Sources represent a remote HTTP data source.  Sources contain Datasets and
 * Narratives (both Resources).  Datasets and Narratives have Subresources
 * representing specific files/data that make up the conceptual Resource as a
 * whole.
 *
 * Source
 *   Dataset                (implements Resource interface)
 *     DatasetSubresource   (implements Subresource interface)
 *   Narrative              (implements Resource interface)
 *     NarrativeSubresource (implements Subresource interface)
 *
 * Subresources are separate from Resources so that our code can more easily
 * talk about, address, and pass around values representing both the conceptual
 * whole of a dataset or narrative and the concrete individual files making up
 * those wholes.
 *
 * A concrete example:
 *
 * CoreSource (in ./core.js) represents an S3 bucket (s3://nextstrain-data).
 *
 *   const coreSource = new CoreSource()
 *
 * The core dataset "flu/seasonal/h3n2/ha/2y" is represented by a Dataset
 * instance you get by calling:
 *
 *   const dataset = coreSource.dataset(["flu", "seasonal", "h3n2", "ha", "2y"])
 *
 * That Dataset has Subresources identified by the names "main" and
 * "tip-frequencies", which you get by calling:
 *
 *   dataset.subresource("main")
 *   dataset.subresource("tip-frequencies")
 *
 * These Subresources can be retrieved at the following URLs, which you obtain
 * using the Subresource.url() method:
 *
 *   https://nextstrain-data.s3.amazonaws.com/flu_seasonal_h3n2_ha_2y.json
 *   https://nextstrain-data.s3.amazonaws.com/flu_seasonal_h3n2_ha_2y_tip-frequencies.json
 *
 * Typically, the URL for a specific Subresource is composed from details in
 * the Source, Resource, and Subresource instances.  For example:
 *
 *   https://nextstrain-data.s3.amazonaws.com/flu_seasonal_h3n2_ha_2y_tip-frequencies.json
 *   \______________________________________/ \_____________________/ \__________________/
 *                from Source                      from Dataset              from
 *                                                                     DatasetSubresource
 *
 * The actual URL construction varies between implementations but is broadly
 * similar.
 *
 * These abstract model classes make it possible for the codebase to support
 * interchangable data sources with different ways of actually storing the
 * data.  They provide places to attach information like authorization rules
 * and URL structure.  Subclasses of these model classes define their specific
 * implementation details and override any base behaviour which doesn't apply
 * to them (ideally limited).
 *
 * The advantages of passing around URLs (i.e. passing data by reference)
 * instead of directly returning the data or even an IO stream include:
 *
 *    - You can implement the latter (returning the data or IO streams) with
 *      the former (URLs), but not vice versa.
 *
 *    - URLs and HTTP are a looser coupling between components, which for
 *      example, makes it easier to change one component later without
 *      affecting another.
 *
 *    - We can re-use the design decisions already made by the HTTP spec for
 *      how to transmit metadata about some data stream (encoding, content
 *      type, caching, last modified, etc) so we don't have to re-invent this.
 *
 *    - HTTP for the upstream sources aligns with our most common context of
 *      responding to downstream HTTP clients, and so the opportunities for
 *      optimization through alignment are greater.  For example, one
 *      optimization might be to dynamically choose to redirect a downstream
 *      client to a subresource URL if the upstream source supports CORs
 *      (instead of always proxying the data through us).
 *
 *  -trs, Dec 2021
 */

class Source {
  async baseUrl() {
    throw new Error("async baseUrl() must be implemented by subclasses");
  }
  async urlFor(path, method = 'GET', headers = {}) { // eslint-disable-line no-unused-vars
    const url = new URL(path, await this.baseUrl());
    return url.toString();
  }
  dataset(pathParts) {
    return new Dataset(this, pathParts);
  }
  narrative(pathParts) {
    return new Narrative(this, pathParts);
  }

  // eslint-disable-next-line no-unused-vars
  secondTreeOptions(path) {
    return [];
  }

  async availableDatasets() {
    return [];
  }
  async availableNarratives() {
    return [];
  }
  async getInfo() {
    throw new Error("getInfo() must be implemented by subclasses");
  }

  get authzPolicy() {
    throw new Error("get authzPolicy() must be implemented by subclasses");
  }
  get authzTags() {
    return new Set([
      authzTags.Type.Source,
    ]);
  }
  get authzTagsToPropagate() {
    return new Set();
  }
  static toString() {
    return `[${this.name} class]`;
  }
  toString() {
    return `[${this.constructor.name} object]`;
  }
}

class Resource {
  constructor(source, pathParts) {
    this.source = source;
    this.pathParts = pathParts;

    // Require baseParts, otherwise we have no actual dataset/narrative path.
    // This inspects baseParts because some of the pathParts (above) may not
    // apply, which each Dataset/Narrative subclass determines for itself.
    if (!this.baseParts.length) {
      throw new Error(`no Resource path provided (${this.constructor.name}.baseParts is empty)`);
    }
  }
  get baseParts() {
    return this.pathParts.slice();
  }
  get baseName() {
    return this.baseParts.join("_");
  }
  async exists() {
    throw new Error("exists() must be implemented by Resource subclasses");
  }
  static get Subresource() {
    throw new Error("static Subresource property must be set by Resource subclasses");
  }
  get Subresource() {
    return this.constructor.Subresource;
  }
  subresource(type) {
    return new this.Subresource(this, type);
  }
  subresources() {
    return this.Subresource.validTypes.map(type => this.subresource(type));
  }
}

class Subresource {
  constructor(resource, type) {
    if (this.constructor === Subresource) {
      throw new Error("Subresource interface class must be subclassed");
    }
    if (!(resource instanceof Resource)) {
      throw new Error(`invalid Subresource parent resource type: ${resource.constructor}`);
    }
    if (!this.constructor.validTypes.includes(type)) {
      throw new Error(`invalid Subresource type: ${type}`);
    }
    this.resource = resource;
    this.type = type;
  }
  static get validTypes() {
    throw new Error("validTypes() must be implemented by Subresource subclasses");
  }
  async url(method = 'GET', headers = {}) {
    return await this.resource.source.urlFor(this.baseName, method, headers);
  }
  get baseName() {
    throw new Error("baseName() must be implemented by Subresource subclasses");
  }
  get mediaType() {
    throw new Error("mediaType() must be implemented by SubResource subclasses");
  }
  get accept() {
    return this.mediaType;
  }
}


class Dataset extends Resource {
  static get Subresource() {
    return DatasetSubresource;
  }

  async exists() {
    const method = "HEAD";
    const _exists = async (type) =>
      (await fetch(await this.subresource(type).url(method), {method, cache: "no-store"})).status === 200;

    const all = async (...promises) =>
      (await Promise.all(promises)).every(x => x);

    return (await _exists("main"))
        || (await all(_exists("meta"), _exists("tree")))
        || false;
  }

  /**
   * Resolve this Dataset to its full canonical path, if this one is partially
   * specified and defaults exist (i.e. if this one is an alias).
   *
   * For example, in our core source, /flu/seasonal/h3n2 is an alias for
   * /flu/seasonal/h3n2/ha/2y.
   *
   * Returns this Dataset itself if it's already the canonical one or no
   * aliases exist.  Thus, you can compare `dataset === dataset.resolve()` to
   * see if `dataset` is an alias.
   *
   * @returns {Dataset}
   */
  resolve() {
    return this;
  }

  get authzTags() {
    return new Set([
      ...this.source.authzTagsToPropagate,
      authzTags.Type.Dataset,
    ]);
  }
}

class DatasetSubresource extends Subresource {
  static validTypes = ["main", "root-sequence", "tip-frequencies", "measurements", "meta", "tree"];

  mediaType = `application/vnd.nextstrain.dataset.${this.type}+json`;

  accept = [
    this.mediaType,
    "application/json; q=0.9",
    "text/plain; q=0.1",

    /* The only type used by media.githubusercontent.com for objects in Git
     * LFS, important for Community on GitHub datasets.  Anecodotally, this is
     * also commonly used by (poorly-configured) static web servers for .json
     * files, which we might encounter with /fetch/… datasets.
     *   -trs, 20 July 2022
     */
    "application/octet-stream; q=0.01",
  ].join(", ");

  get baseName() {
    return this.type === "main"
      ? `${this.resource.baseName}.json`
      : `${this.resource.baseName}_${this.type}.json`;
  }
}


class Narrative extends Resource {
  static get Subresource() {
    return NarrativeSubresource;
  }

  async exists() {
    const method = "HEAD";
    const _exists = async () =>
      (await fetch(await this.subresource("md").url(method), {method, cache: "no-store"})).status === 200;

    return (await _exists()) || false;
  }

  get authzTags() {
    return new Set([
      ...this.source.authzTagsToPropagate,
      authzTags.Type.Narrative,
    ]);
  }
}

class NarrativeSubresource extends Subresource {
  static validTypes = ["md"];

  mediaType = "text/vnd.nextstrain.narrative+markdown";

  accept = [
    this.mediaType,
    "text/markdown; q=0.9",
    "text/*; q=0.1",
  ].join(", ");

  get baseName() {
    return `${this.resource.baseName}.md`;
  }
}


export {
  Source,
  Resource,
  Subresource,

  Dataset,
  DatasetSubresource,

  Narrative,
  NarrativeSubresource,
};
