/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
const {fetch} = require("../fetch");
const {NoResourcePathError} = require("../exceptions");
const utils = require("../utils");

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
 * CoreSource (in ./core.js) represents a Cloudfront distribution
 * (https://data.nextstrain.org) in front of an S3 bucket
 * (s3://nextstrain-data).
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
 *   https://data.nextstrain.org/flu_seasonal_h3n2_ha_2y.json
 *   https://data.nextstrain.org/flu_seasonal_h3n2_ha_2y_tip-frequencies.json
 *
 * Typically, the URL for a specific Subresource is composed from details in
 * the Source, Resource, and Subresource instances.  For example:
 *
 *   https://data.nextstrain.org/flu_seasonal_h3n2_ha_2y_tip-frequencies.json
 *   \_________________________/ \_____________________/ \__________________/
 *          from Source               from Dataset              from
 *                                                        DatasetSubresource
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
 */

class Source {
  static get _name() {
    throw new Error("_name() must be implemented by subclasses");
  }
  get name() {
    return this.constructor._name;
  }
  async baseUrl() {
    throw new Error("async baseUrl() must be implemented by subclasses");
  }
  async urlFor(path, method = 'GET') { // eslint-disable-line no-unused-vars
    const url = new URL(path, await this.baseUrl());
    return url.toString();
  }
  static isGroup() { /* is the source a "nextstrain group"? */
    return false;
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

  availableDatasets() {
    return [];
  }
  availableNarratives() {
    return [];
  }

  /* Static access control for this entire source, regardless of any
   * instance-specific parameters.
   */
  static visibleToUser(user) { // eslint-disable-line no-unused-vars
    return true;
  }

  /* Instance-specific access control delegates to the static method by
   * default.
   */
  visibleToUser(user) {
    return this.constructor.visibleToUser(user);
  }

  async getInfo() {
    throw new Error("getInfo() must be implemented by subclasses");
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
      throw new NoResourcePathError();
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
  subresource(type) { // eslint-disable-line no-unused-vars
    throw new Error("subresource() must be implemented by Resource subclasses");
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
  async url(method = 'GET') {
    return await this.resource.source.urlFor(this.baseName, method);
  }
  get baseName() {
    throw new Error("baseName() must be implemented by Subresource subclasses");
  }
}


class Dataset extends Resource {
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
    /* XXX TODO: Reimplement this in terms of methods on the source, not by
     * breaking encapsulation by using a process-wide global.
     *   -trs, 26 Oct 2021 (based on a similar comment 5 Sept 2019)
     */
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

    /* if we are here, then the path doesn't match any available datasets exactly */
    const nextDefaultPart = global.availableDatasets.defaults[sourceName][prefix];

    if (nextDefaultPart) {
      const dataset = new this.constructor(this.source, [...prefixParts, nextDefaultPart]);
      return dataset.resolve();
    }

    return this;
  }

  get isRequestValidWithoutDataset() {
    return false;
  }

  subresource(type) {
    return new DatasetSubresource(this, type);
  }
}

class DatasetSubresource extends Subresource {
  static validTypes = ["main", "root-sequence", "tip-frequencies", "meta", "tree"];

  get baseName() {
    return this.type === "main"
      ? `${this.resource.baseName}.json`
      : `${this.resource.baseName}_${this.type}.json`;
  }
}


class Narrative extends Resource {
  async exists() {
    const method = "HEAD";
    const _exists = async () =>
      (await fetch(await this.subresource("md").url(method), {method, cache: "no-store"})).status === 200;

    return (await _exists()) || false;
  }

  subresource(type) {
    return new NarrativeSubresource(this, type);
  }
}

class NarrativeSubresource extends Subresource {
  static validTypes = ["md"];

  get baseName() {
    return `${this.resource.baseName}.md`;
  }
}


module.exports = {
  Source,
  Resource,
  Subresource,

  Dataset,
  DatasetSubresource,

  Narrative,
  NarrativeSubresource,
};
