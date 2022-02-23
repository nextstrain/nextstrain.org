const authz = require("../authz");
const {fetch} = require("../fetch");
const queryString = require("query-string");
const {NotFound} = require('http-errors');
const utils = require("../utils");
const {Source} = require("./models");

const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";

class CoreSource extends Source {
  static get _name() { return "core"; }
  async baseUrl() { return "http://data.nextstrain.org/"; }
  get repo() { return "nextstrain/narratives"; }
  get branch() { return "master"; }

  async urlFor(path, method = 'GET', headers = {}) { // eslint-disable-line no-unused-vars
    const baseUrl = path.endsWith(".md")
      ? `https://raw.githubusercontent.com/${this.repo}/${await this.branch}/`
      : await this.baseUrl();

    const url = new URL(path, baseUrl);
    return url.toString();
  }

  // The computation of these globals should move here.
  secondTreeOptions(path) {
    return (global.availableDatasets.secondTreeOptions[this.name] || {})[path] || [];
  }

  availableDatasets() {
    return global.availableDatasets[this.name] || [];
  }

  async availableNarratives() {
    const qs = queryString.stringify({ref: this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents?${qs}`, {headers: {authorization}});

    if (response.status === 404) throw new NotFound();
    else if (response.status !== 200 && response.status !== 304) {
      utils.warn(`Error fetching available narratives from GitHub for source ${this.name}`, await utils.responseDetails(response));
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
  static get _name() { return "staging"; }
  async baseUrl() { return "http://staging.nextstrain.org/"; }
  get repo() { return "nextstrain/narratives"; }
  get branch() { return "staging"; }
}

module.exports = {
  CoreSource,
  CoreStagingSource,
};
