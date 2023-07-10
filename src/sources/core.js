import * as authz from '../authz/index.js';

import { fetch } from '../fetch.js';
import { NotFound } from '../httpErrors.js';
import * as utils from '../utils/index.js';
import { parseInventory, coreBucketKeyMunger } from "../utils/inventories.js";
import { Source, Dataset } from './models.js';
import { CollectedResources } from "./collectedResources.js";

const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";

class CoreSource extends Source {
  get name() { return "core"; }
  async baseUrl() { return "https://nextstrain-data.s3.amazonaws.com/"; }
  get repo() { return "nextstrain/narratives"; }
  get branch() { return "master"; }

  // eslint-disable-next-line no-unused-vars
  async urlFor(path, method = 'GET', headers = {}) {
    const baseUrl = path.endsWith(".md")
      ? `https://raw.githubusercontent.com/${this.repo}/${await this.branch}/`
      : await this.baseUrl();

    const url = new URL(path, baseUrl);
    return url.toString();
  }

  dataset(pathParts) {
    return new CoreDataset(this, pathParts);
  }

  // The computation of these globals should move here. 
  secondTreeOptions(path) {
    return (global.availableDatasets.secondTreeOptions[this.name] || {})[path] || [];
  }

  async collectResources() {
    if (!this._allResources) this._allResources = new Map();
    const s3objects = await parseInventory();
    const datasets = new Map(), files = new Map();
    s3objects.forEach((object) => {
      const [name, resourceType] = CoreCollectedResources.objectName(object);
      if (!name) return;
      if (resourceType === 'dataset') {
        datasets.has(name) ? datasets.get(name).push(object) : datasets.set(name, [object]);
      } else if (resourceType === 'file') {
        files.has(name) ? files.get(name).push(object) : files.set(name, [object]);
      }
    })
    this._allResources.set(
      'dataset',
      Array.from(datasets).map(([, objects]) => new CoreCollectedResources(this, objects))
    );
    this._allResources.set(
      'file',
      Array.from(files).map(([, objects]) => new CoreCollectedResources(this, objects))
    );
    // TODO XXX narratives
  }

  // DEPRECATED availableDatasets is used by /charon/getAvailable and will be replaced once we move to a new API
  async availableDatasets() {
    return global.availableDatasets[this.name] || [];
  }

  // DEPRECATED availableNarratives is used by /charon/getAvailable and will be replaced once we move to a new API
  async availableNarratives() {
    const qs = new URLSearchParams({ref: this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents?${qs}`, {headers: {authorization}});

    if (response.status === 404) throw new NotFound();
    else if (response.status !== 200 && response.status !== 304) {
      utils.warn(`Error fetching available narratives from GitHub for ${this}`, await utils.responseDetails(response));
      return [];
    }

    const files = await response.json();
    return files
      .filter((file) => file.type === "file")
      .filter((file) => file.name !== "README.md")
      .filter((file) => file.name.endsWith(".md"))
      .map((file) => file.name
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
  }

  async getInfo() {
    return {
      title: `Nextstrain ${this.name} datasets & narratives`,
      showDatasets: true,
      showNarratives: true,
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

class CoreStagingSource extends CoreSource {
  get name() { return "staging"; }
  async baseUrl() { return "https://nextstrain-staging.s3.amazonaws.com/"; }
  get repo() { return "nextstrain/narratives"; }
  get branch() { return "staging"; }
}

class CoreDataset extends Dataset {
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
}

class CoreCollectedResources extends CollectedResources {

  static objectName(object) {
    return coreBucketKeyMunger(object);
  }

  lastUpdated(version=this._versions[0]) {
    return version.LastModifiedDate;
  }
  
  filter(options) {
    /**
     * We can perform authorization here by either calling 
     * authz.authorized(user, authz.actions.Read, object),
     * See note above for more details.
     */
    
    if (options.prefixParts.length) {
      const pp = this.prefixParts;
      if (!options.prefixParts.every((p, i) => pp[i]===p)) {
        return false;
      }
    }
    return true;
  }

  get prefixParts() {
    return this.name.split("/");
  }

  nextstrainUrl(version=this._versions[0]) {
    if (this._resourceType === 'file') {
      if (version.IsLatest!=="true") return false;
      return `https://nextstrain-data.s3.amazonaws.com/${version.Key}`
    }
    if (this._resourceType === 'dataset') {
      if (version.IsLatest!=="true") return false;
      // if the version is not the latest (in S3 terminology), then we don't yet have the
      // ability to access it via Auspice. Or perhaps we do via /fetch? TODO
      return version.Key.replace('.json', '').replace(/_/g, '/')
    }
    return false;
  }
}

export {
  CoreSource,
  CoreStagingSource,
};
