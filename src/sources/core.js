/* eslint no-use-before-define: ["error", {"functions": false, "classes": false}] */
import * as authz from '../authz/index.js';

import { fetch } from '../fetch.js';
import { NotFound } from '../httpErrors.js';
import * as utils from '../utils/index.js';
import { Source, Dataset } from './models.js';

const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";

class CoreSource extends Source {
  get name() { return "core"; }
  async baseUrl() { return "https://nextstrain-data.s3.amazonaws.com/"; }
  get repo() { return "nextstrain/narratives"; }
  get branch() { return "master"; }

  async urlFor(path, method = 'GET', headers = {}) { // eslint-disable-line no-unused-vars
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

  async availableDatasets() {
    return global.availableDatasets[this.name] || [];
  }

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

export {
  CoreSource,
  CoreStagingSource,
};
