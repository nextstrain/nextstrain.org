import * as authz from '../authz/index.js';

import { fetch } from '../fetch.js';
import { NotFound } from '../httpErrors.js';
import * as utils from '../utils/index.js';
import { Source, Dataset, Narrative } from './models.js';

const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";

class CommunitySource extends Source {
  constructor(owner, repoName) {
    super();

    // The GitHub owner and repo names are required.
    if (!owner) throw new Error(`Cannot construct a ${this.constructor.name} without an owner`);
    if (!repoName) throw new Error(`Cannot construct a ${this.constructor.name} without a repoName`);

    this.owner = owner;
    [this.repoName, this.branch] = repoName.split(/@/, 2);
    this.branchExplicitlyDefined = !!this.branch;

    if (!this.repoName) throw new Error(`Cannot construct a ${this.constructor.name} without a repoName after splitting on /@/`);

    const repoInfo = fetch(`https://api.github.com/repos/${this.owner}/${this.repoName}`, {headers: {authorization}});
    this.repoExists = repoInfo
      .then((res) => res.ok)
      .catch(() => false);
    this.defaultBranch = repoInfo
      .then((res) => res.json())
      .then((data) => data.default_branch ?? "master")
      .catch(() => {
        console.log(`Error interpreting the default branch of ${this.constructor.name} for ${this.owner}/${this.repoName}`);
        return "master";
      });
    if (!this.branch) {
      this.branch = this.defaultBranch;
    }
  }

  get repo() { return `${this.owner}/${this.repoName}`; }
  async baseUrl() {
    /* It's important to go thru github.com and let it redirect us to the final
     * location, e.g. usually on raw.githubcontent.com.  We can't directly
     * access the final location even though it seems constructable because
     * some community repos use Git LFS to store their files and LFS blobs are
     * hosted on a different final domain, media.githubusercontent.com.
     *   -trs, 17 Feb 2023
     */
    return `https://github.com/${this.repo}/raw/${await this.branch}/`;
  }

  async repoNameWithBranch() {
    const branch = await this.branch;
    const defaultBranch = await this.defaultBranch;
    if (branch === defaultBranch && !this.branchExplicitlyDefined) {
      return this.repoName;
    }
    return `${this.repoName}@${branch}`;
  }

  dataset(pathParts, versionDescriptor) {
    return new CommunityDataset(this, pathParts, versionDescriptor);
  }
  narrative(pathParts, versionDescriptor) {
    return new CommunityNarrative(this, pathParts, versionDescriptor);
  }

  async availableDatasets() {
    const qs = new URLSearchParams({ref: await this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/auspice?${qs}`, {headers: {authorization}});

    if (response.status !== 200 && response.status !== 304) {
      if (response.status !== 404) {
        // not found doesn't warrant an error print, it means there are no datasets for this repo
        utils.warn(`Error fetching available datasets from GitHub for ${this}`, await utils.responseDetails(response));
      }
      return [];
    }

    const files = await response.json();

    if (!Array.isArray(files)) {
      // "auspice" might be a file, in which case we get an object back.
      return [];
    }

    const filenames = files
      .filter((file) => file.type === "file")
      // remove anything which doesn't start with the repo name, which is required of community datasets
      .filter((file) => file.name.startsWith(this.repoName))
      .map((file) => file.name);
    const pathnames = utils.getDatasetsFromListOfFilenames(filenames)
      // strip out the repo name from the start of the pathnames
      // as CommunityDataset().baseParts will add this in
      .map((pathname) => this.removeLeadingRepoName(pathname));
    return pathnames;
  }

  async availableNarratives() {
    const qs = new URLSearchParams({ref: await this.branch});
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/narratives?${qs}`, {headers: {authorization}});

    if (response.status !== 200 && response.status !== 304) {
      if (response.status !== 404) {
        // not found doesn't warrant an error print, it means there are no narratives for this repo
        utils.warn(`Error fetching available narratives from GitHub for ${this}`, await utils.responseDetails(response));
      }
      return [];
    }

    const files = await response.json();

    if (!Array.isArray(files)) {
      // "narratives" might be a file, in which case we get an object back.
      return [];
    }

    return files
      .filter((file) => file.type === "file")
      .filter((file) => file.name !== "README.md")
      .filter((file) => file.name.endsWith(".md"))
      .filter((file) => file.name.startsWith(this.repoName))
      .map((file) => file.name
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"))
      .map((path) => this.removeLeadingRepoName(path));
  }

  removeLeadingRepoName(path) {
    // nested dataset for repo
    if (path.startsWith(`${this.repoName}/`)) {
      return path.slice(`${this.repoName}/`.length);
    }

    // default dataset for repo
    if (path.startsWith(this.repoName)) {
      return path.slice(this.repoName.length);
    }

    return path;
  }

  async getInfo() {
    /* could attempt to fetch a certain file from the repository if we want to implement
    this functionality in the future */
    if (!await this.repoExists) {
      throw new NotFound(`${this.owner}/${this.repoName} doesn't exist (or is private)`);
    }
    const branch = await this.branch;
    return {
      title: `${this.owner}'s "${this.repoName}" community builds`,
      byline: `
        Nextstrain community builds for GitHub → ${this.owner}/${this.repoName} (${branch} branch).
        The available datasets and narratives in this repository are listed below.
      `,
      website: null,
      showDatasets: true,
      showNarratives: true,
      /* avatar could be fetched here & sent in base64 or similar, or a link sent. The former (or similar) has the advantage
      of private S3 buckets working, else the client will have to make (a) an authenticated request (too much work)
      or (b) a subsequent request to nextstrain.org/charon (why not do it at once?) */
      avatar: `https://github.com/${this.owner}.png?size=200`
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

class CommunityDataset extends Dataset {
  get baseParts() {
    // We require datasets are in the auspice/ directory and include the repo
    // name in the file basename.
    return [`auspice/${this.source.repoName}`, ...this.pathParts];
  }
}

class CommunityNarrative extends Narrative {
  get baseParts() {
    // We require narratives are in the narratives/ directory and include the
    // repo name in the file basename.
    return [`narratives/${this.source.repoName}`, ...this.pathParts];
  }
}

export {
  CommunitySource,
};
