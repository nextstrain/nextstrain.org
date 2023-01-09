/* eslint-disable no-use-before-define */
import jszip from 'jszip';
import mime from 'mime';
import { pipeline } from 'stream/promises';
import { BadRequest, InternalServerError, NotFound, ServiceUnavailable } from '../httpErrors.js';
import { fetch } from '../fetch.js';


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
  assertStatusOk(response);

  const release = await response.json();
  const assetName = `nextstrain-cli-${release.tag_name}-${assetSuffix}`;
  const asset = release.assets.find(a => a.name === assetName);

  if (!asset) {
    throw new NotFound(`${release.url} (${release.tag_name}) contains no asset matching ${assetName}`);
  }

  return res.redirect(asset.browser_download_url);
};


const downloadCIBuild = async (req, res) => {
  if (!authorization) {
    throw new ServiceUnavailable("Server does not have authorization to download CI builds.");
  }

  const runId = req.params.runId;
  const assetSuffix = req.params.assetSuffix;
  if (!runId || !assetSuffix) throw new BadRequest();

  const endpoint = `https://api.github.com/repos/nextstrain/cli/actions/runs/${encodeURIComponent(runId)}/artifacts`;

  const apiResponse = await fetch(endpoint, {headers: {authorization}});
  assertStatusOk(apiResponse);

  const artifacts = (await apiResponse.json()).artifacts;
  const artifactName = assetSuffix.replace(/[.](tar[.]gz|zip)$/, "");
  const artifact = artifacts.find(a => a.name === artifactName);

  if (!artifact) {
    throw new NotFound(`${endpoint} contains no artifact matching ${artifactName}`);
  }

  // Fetch the artifact's ZIP archive and unwrap the build archive inside.
  const zipUrl = artifact.archive_download_url;
  const zipResponse = await fetch(zipUrl, {headers: {authorization}});
  assertStatusOk(zipResponse);

  /* Unfortunately, this loads the entire ZIP into memory.  I couldn't find a
   * library which supported streaming loads.  The closest was an outstanding
   * PR of unknown status for node-stream-zip.¹  Ah well, this endpoint should
   * only get light use by us developers anyway.
   *   -trs, 6 Jan 2023
   *
   * ¹ https://github.com/antelle/node-stream-zip/pull/91/files
   */
  const zip = await jszip.loadAsync(zipResponse.arrayBuffer());
  const asset = zip.filter((basename, file) => file.name.endsWith(`-${assetSuffix}`))[0];

  if (!asset) {
    throw new NotFound(`Artifact ZIP ${zipUrl} contains no file matching ${assetSuffix}`);
  }

  res.set("Content-Type", mime.getType(assetSuffix) || "application/octet-stream");

  await pipeline(asset.nodeStream(), res);
  return res.end();
};


const assertStatusOk = (response) => {
  switch (response.status) {
    case 200:
      break;

    case 404:
      throw new NotFound();

    default:
      throw new InternalServerError(`upstream said: ${response.status} ${response.statusText}`);
  }
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


export {
  download,
  downloadCIBuild,
  installer,
};
