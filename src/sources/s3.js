const AWS = require("aws-sdk");
const zlib = require("zlib");
const yamlFront = require("yaml-front-matter");
const utils = require("../utils");
const {Source} = require("./models");

const S3 = new AWS.S3();

class S3Source extends Source {
  get bucket() {
    throw new Error("bucket() must be implemented by subclasses");
  }
  async baseUrl() {
    return `https://${this.bucket}.s3.amazonaws.com`;
  }
  async _listObjects() {
    return new Promise((resolve, reject) => {
      let contents = [];
      S3.listObjectsV2({Bucket: this.bucket}).eachPage((err, data, done) => {
        if (err) {
          utils.warn(`Could not list S3 objects for group '${this.name}'\n${err.message}`);
          return reject(err);
        }
        if (data===null) { // no more data
          return resolve(contents);
        }
        contents = contents.concat(data.Contents);
        return done();
      });
    });
  }
  async availableDatasets() {
    const objects = await this._listObjects();
    const pathnames = utils.getDatasetsFromListOfFilenames(objects.map((object) => object.Key));
    return pathnames;
  }
  async availableNarratives() {
    // Walking logic borrowed from auspice's cli/server/getAvailable.js
    const objects = await this._listObjects();
    return objects
      .map((object) => object.Key)
      .filter((file) => file !== 'group-overview.md')
      .filter((file) => file.endsWith(".md"))
      .map((file) => file
        .replace(/[.]md$/, "")
        .split("_")
        .join("/"));
  }
  async getAndDecompressObject(key) {
    const object = await S3.getObject({ Bucket: this.bucket, Key: key}).promise();
    if (object.ContentEncoding === 'gzip') {
      object.Body = zlib.gunzipSync(object.Body);
    }
    return object.Body;
  }
  parseOverviewMarkdown(overviewMarkdown) {
    const frontMatter = yamlFront.loadFront(overviewMarkdown);
    if (!frontMatter.title) {
      throw new Error("The overview file requires `title` in the frontmatter.");
    }

    if (frontMatter.website) {
      if (!frontMatter.website.includes("http")) {
        throw new Error("The website field in the overview file requires \"http\" to be present.");
      }
    }

    if (frontMatter.showDatasets && typeof frontMatter.showDatasets !== 'boolean') {
      throw new Error("The `showDatasets` field in the frontmatter must be a boolean.");
    }

    if (frontMatter.showNarratives && typeof frontMatter.showNarratives !== 'boolean') {
      throw new Error("The `showNarratives` field in the frontmatter must be a boolean.");
    }

    // handle files with CRLF endings (windows)
    const content = frontMatter.__content.replace(/\r\n/g, "\n");

    return [frontMatter.title, frontMatter.byline, frontMatter.website, frontMatter.showDatasets, frontMatter.showNarratives, content];
  }
  /**
   * Get information about a (particular) source.
   * The data could be a JSON, or a markdown with YAML frontmatter. Or something else.
   * This is very similar to our previous discussions around moving the auspice footer
   * content to the dataset JSON. One advantage of this being outside of the auspice
   * codebase is that we can iterate on it after pushing live to nextstrain.org
   */
  async getInfo() {
    try {
      /* attempt to fetch customisable information from S3 bucket */
      const objects = await this._listObjects();
      const objectKeys = objects.map((object) => object.Key);

      let logoSrc;
      if (objectKeys.includes("group-logo.png")) {
        // Use pre-signed URL to allow client to fetch from private S3 bucket
        logoSrc = S3.getSignedUrl('getObject', {Bucket: this.bucket, Key: "group-logo.png"});
      }

      let title = `"${this.name}" Nextstrain group`;
      let byline = `The available datasets and narratives in this group are listed below.`;
      let website = null;
      let showDatasets = true;
      let showNarratives = true;
      let overview;
      if (objectKeys.includes("group-overview.md")) {
        const overviewContent = await this.getAndDecompressObject("group-overview.md");
        [title, byline, website, showDatasets, showNarratives, overview] = this.parseOverviewMarkdown(overviewContent);
        // Default show datasets & narratives if not specified in customization
        if (showDatasets == null) showDatasets = true;
        if (showNarratives == null) showNarratives = true;
      }

      return {
        title: title,
        byline: byline,
        website: website,
        showDatasets: showDatasets,
        showNarratives: showNarratives,
        avatar: logoSrc,
        overview: overview
      };

    } catch (err) {
      /* Appropriate fallback if no customised data is available */
      return {
        title: `"${this.name}" Nextstrain group`,
        byline: `The available datasets and narratives in this group are listed below.`,
        website: null,
        showDatasets: true,
        showNarratives: true,
        error: `Error in custom group info: ${err.message}`
      };
    }
  }
}

class PrivateS3Source extends S3Source {
  static visibleToUser(user) { // eslint-disable-line no-unused-vars
    throw new Error("visibleToUser() must be implemented explicitly by subclasses (not inherited from PrivateS3Source)");
  }
  async urlFor(path, method = 'GET') {
    return S3.getSignedUrl(method === "HEAD" ? "headObject" : "getObject", {
      Bucket: this.bucket,
      Key: path
    });
  }
}

module.exports = {
  S3Source,
  PrivateS3Source,
};
