import jszip from 'jszip';
import mime from 'mime';
import { pipeline } from 'stream/promises';
import { BadRequest, InternalServerError, NotFound, ServiceUnavailable } from '../httpErrors.js';
import { fetch } from '../fetch.js';
import { uri } from '../templateLiterals.js';


const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";


const download = async (req, res) => {
  const version = req.params.version;
  const assetSuffix = req.params.assetSuffix;
  if (!version || !assetSuffix) throw new BadRequest();

  const endpoint = version === "latest"
    ? "https://api.github.com/repos/nextstrain/cli/releases/latest"
    : uri`https://api.github.com/repos/nextstrain/cli/releases/tags/${version}`;

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


const downloadPRBuild = async (req, res) => {
  const prId = Number(req.params.prId);
  if (!prId || !Number.isFinite(prId)) throw new BadRequest("PR id is not a number");

  /* Lookup head ref (branch name) and repository full name (e.g.
   * nextstrain/cli) for this PR, so we can identify all workflow runs
   * associated with it.  Not all PR-associated workflow runs contain entries
   * in the run's "pull_request" array.
   */
  const prResponse = await fetch(uri`https://api.github.com/repos/nextstrain/cli/pulls/${prId}`, {headers: {authorization}});
  assertStatusOk(prResponse);

  const pr = await prResponse.json();
  const prRef = pr.head.ref;
  const prRepo = pr.head.repo.full_name;

  // Last 100 successful CI runs matching the PR's head branch name.  This may
  // apply to multiple PR ids, so we limit by PR head repo too after the fetch.
  const params = new URLSearchParams({
    event: "pull_request",
    branch: prRef,
    status: "success",
    page_size: 100,
  });
  const runsResponse = await fetch(`https://api.github.com/repos/nextstrain/cli/actions/workflows/ci.yaml/runs?${params}`, {headers: {authorization}});
  assertStatusOk(runsResponse);

  // Find latest run for our desired PR
  const runs = (await runsResponse.json()).workflow_runs;
  const prRuns = runs.filter(run => run.head_branch === prRef && run.head_repository.full_name === prRepo);
  const runId = prRuns[0]?.id;

  if (!runId) {
    throw new NotFound(`No CI run for PR ${prId} found in last ${params.get("page_size")} successful CI runs for PRs`);
  }

  // Set the CI run id for downloadCIBuild()
  req.params.runId = runId;

  return await downloadCIBuild(req, res);
};


const downloadCIBuild = async (req, res) => {
  if (!authorization) {
    throw new ServiceUnavailable("Server does not have authorization to download CI builds.");
  }

  const runId = req.params.runId;
  const assetSuffix = req.params.assetSuffix;
  if (!runId || !assetSuffix) throw new BadRequest();

  const endpoint = uri`https://api.github.com/repos/nextstrain/cli/actions/runs/${runId}/artifacts`;

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
      return res.redirect("https://raw.githubusercontent.com/nextstrain/cli/HEAD/bin/standalone-installer-unix");

    case "windows":
      return res.redirect("https://raw.githubusercontent.com/nextstrain/cli/HEAD/bin/standalone-installer-windows");

    default:
      throw new NotFound(`No installer for OS: ${os}`);
  }
};


export {
  download,
  downloadPRBuild,
  downloadCIBuild,
  installer,
};
