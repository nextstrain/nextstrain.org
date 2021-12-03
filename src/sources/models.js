/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
const {fetch} = require("../fetch");
const {NoResourcePathError} = require("../exceptions");
const utils = require("../utils");


/* These Source, Dataset, and Narrative classes contain information to map an
 * array of dataset/narrative path parts onto a URL.  Source selection and
 * dataset path aliasing (/flu → /flu/seasonal/h3n2/ha/3y) is handled in
 * utils/prefix.parsePrefix().
 *
 * The class definitions would be a bit shorter/prettier if we were using Babel
 * to allow class properties on Node.
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
