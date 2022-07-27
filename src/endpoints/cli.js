const {BadRequest, InternalServerError, NotFound} = require("http-errors");
const {fetch} = require("../fetch");


const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";


const download = async (req, res) => {
  const assetSuffix = req.params.assetSuffix;
  if (!assetSuffix) throw new BadRequest();

  const response = await fetch("https://api.github.com/repos/nextstrain/cli/releases/latest", {headers: {authorization}});

  if (response.status !== 200) {
    throw new InternalServerError(`upstream said: ${response.status} ${response.statusText}`);
  }

  const release = await response.json();
  const assetName = `nextstrain-cli-${release.tag_name}-${assetSuffix}`;
  const asset = release.assets.find(a => a.name === assetName);

  if (!asset) {
    throw new NotFound(`latest release (${release.name}) contains no asset matching ${assetName}`);
  }

  return res.redirect(asset.browser_download_url);
};


module.exports = {
  download,
};
