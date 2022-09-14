const {BadRequest, InternalServerError, NotFound} = require("http-errors");
const {fetch} = require("../fetch");


const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";


const download = async (req, res) => {
  const version = req.params.version;
  const assetSuffix = req.params.assetSuffix;
  if (!version || !assetSuffix) throw new BadRequest();

  const endpoint = version === "latest"
    ? "https://api.github.com/repos/nextstrain/cli/releases/latest"
    : `https://api.github.com/repos/nextstrain/cli/releases/tags/${encodeURIComponent(version)}`;

  const response = await fetch(endpoint, {headers: {authorization}});

  switch (response.status) {
    case 200:
      break;

    case 404:
      throw new NotFound();

    default:
      throw new InternalServerError(`upstream said: ${response.status} ${response.statusText}`);
  }

  const release = await response.json();
  const assetName = `nextstrain-cli-${release.tag_name}-${assetSuffix}`;
  const asset = release.assets.find(a => a.name === assetName);

  if (!asset) {
    throw new NotFound(`${release.url} (${release.tag_name}) contains no asset matching ${assetName}`);
  }

  return res.redirect(asset.browser_download_url);
};


const installer = (req, res) => {
  const os = req.params.os;
  switch (os) {
    case "linux":
    case "mac":
      return res.redirect("https://github.com/nextstrain/cli/raw/HEAD/bin/standalone-installer-unix");

    case "windows":
      return res.redirect("https://github.com/nextstrain/cli/raw/HEAD/bin/standalone-installer-windows");

    default:
      throw new NotFound(`No installer for OS: ${os}`);
  }
};


module.exports = {
  download,
  installer,
};
