import jszip from 'jszip';
import mime from 'mime';
import pep440 from '@renovatebot/pep440';
import { pipeline } from 'stream/promises';
import { BadRequest, InternalServerError, NotFound, ServiceUnavailable } from '../httpErrors.js';
import { fetch, paginatedFetch } from '../fetch.js';
import { contentTypesProvided } from "../negotiate.js";
import { uri } from '../templateLiterals.js';
import { map } from '../utils/iterators.js';


const authorization = process.env.GITHUB_TOKEN
  ? `token ${process.env.GITHUB_TOKEN}`
  : "";


const info = contentTypesProvided([
  ["application/json", infoJSON],
  ["text/html", (req, res) => res.redirect("https://docs.nextstrain.org/projects/cli/")],
]);

async function infoJSON(req, res) {
  /* This PyPI query was directly ported out of Nextstrain CLI, and I think it
   * makes sense to keep it as-is here.  Other handlers here deal with
   * GitHub releases instead of PyPI distributions since they're specific to
   * our standalone distribution.  We _could_ move this handler to querying
   * GitHub as well, though I don't see a compelling reason to do so.  To the
   * contrary, I noticed a request to the equivalent GitHub API resource is
   * roughly 4x slower than PyPI in my testing!
   *    -trs, 28 April 2025
   *
   * ¹ <https://api.github.com/repos/nextstrain/cli/releases/latest>
   */
  const distribution = await (await fetch("https://pypi.org/pypi/nextstrain-cli/json", {cache: "no-cache"})).json();

  return res.json({
    latest_version: String(distribution?.info?.version),
  });
}


async function download(req, res) {
  const version = req.params.version;
  const assetSuffix = req.params.assetSuffix;
  if (!version || !assetSuffix) throw new BadRequest();

  /* Convert "latest" into a valid version constraint (albeit one with no
   * constraints).
   *
   * Convert an (assumed) exact version into a valid version constraint using
   * the exact equality operator.
   */
  const constraint =
           version === "latest" ?             "" :
    !pep440.validRange(version) ? `==${version}` :
                                         version ;

  /* Fetch all releases, 100 per request.  This will remain only a single
   * request for a while as we currently only have 24 releases to GitHub and
   * the entire project has only had 88 releases (to PyPI) in ~6 years, an
   * average of roughly 15 releases per year.  Additionally, our fetch()
   * caching will greatly reduce actual network traffic and latency.  Taken
   * together, I have no qualms putting this chained set of fetches in the path
   * of every response from this download handler (at least for now).
   *   -trs, 12 Feb 2024
   */
  const releases = new Map(await map(
    paginatedFetch(
      "https://api.github.com/repos/nextstrain/cli/releases?per_page=100", {headers: {authorization}},
      async function* (response) {
        assertStatusOk(response);
        yield* await response.json();
      }
    ),
    r => [r.tag_name, r]
  ));

  const maxSatisfyingVersion = pep440.maxSatisfying([...releases.keys()], constraint);

  if (!maxSatisfyingVersion) {
    throw new NotFound(`No release version matches requested PEP 440/508 version constraint(s): ${constraint || "[none]"} ("${version}")`);
  }

  const release = releases.get(maxSatisfyingVersion);
  const assetName = `nextstrain-cli-${release.tag_name}-${assetSuffix}`;
  const asset = release.assets.find(a => a.name === assetName);

  if (!asset) {
    throw new NotFound(`${release.url} (${release.tag_name}) contains no asset matching ${assetName}`);
  }

  return res.redirect(asset.browser_download_url);
}


async function downloadPRBuild(req, res) {
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
}


async function downloadCIBuild(req, res) {
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
}


function assertStatusOk(response) {
  switch (response.status) {
    case 200:
      break;

    case 404:
      throw new NotFound();

    default:
      throw new InternalServerError(`upstream said: ${response.status} ${response.statusText}`);
  }
}


function installer (req, res) {
  const os = req.params.os;
  switch (os.toLowerCase()) {
    case "linux":
    case "mac":
    case "darwin": // `uname -s` on macOS
      return res.redirect("https://raw.githubusercontent.com/nextstrain/cli/HEAD/bin/standalone-installer-unix");

    case "windows":
      return res.redirect("https://raw.githubusercontent.com/nextstrain/cli/HEAD/bin/standalone-installer-windows");

    default:
      throw new NotFound(`No installer for OS: ${os}`);
  }
}


export {
  info,
  download,
  downloadPRBuild,
  downloadCIBuild,
  installer,
};
