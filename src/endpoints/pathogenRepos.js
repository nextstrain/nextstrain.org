import { fetch, paginatedFetch } from "../fetch.js";
import { BadRequest, InternalServerError, NotFound } from '../httpErrors.js';
import { contentTypesProvided } from "../negotiate.js";
import { uri } from '../templateLiterals.js';
import { slurp } from '../utils/iterators.js';


const headers = {
  Authorization: process.env.GITHUB_TOKEN
    ? `token ${process.env.GITHUB_TOKEN}`
    : "",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};


export async function listVersions(req, res) {
  const name = req.params.name;
  if (!name) throw new BadRequest();

  // Check the repo exists.
  const response = await fetch(uri`https://api.github.com/repos/nextstrain/${name}`, {headers});
  assertStatusOk(response);

  // We'll also use the default branch name in this response.
  const repo = await response.json();

  /* Check that the repo is a pathogen repo, e.g. so we don't return versions
   * for something like Auspice or Nextstrain CLI.
   */
  const registration = await fetch(uri`https://api.github.com/repos/nextstrain/${name}/contents/nextstrain-pathogen.yaml`, {method: "HEAD", headers});
  assertStatusOk(registration);

  // Fetch all tags.
  const tagsUrl = new URL(repo.tags_url);
  tagsUrl.searchParams.set("per_page", "100");

  const tags = new Set(await slurp(
    paginatedFetch(tagsUrl, {headers}, async function* (response) {
      assertStatusOk(response);
      yield* (await response.json()).map(tag => tag.name);
    })
  ));

  /* Use an object container instead of an array container so that we can add
   * properties in the future without breaking API clients, e.g. add a "latest"
   * field or "development" field.
   */
  return res.json({
    /* XXX TODO: Port version sorting logic from Nextstrain CLI to here so all
     * API clients can rely on sorted versions in our response.  The PEP-440
     * library we use in endpoints/cli.js, @renovatebot/pep440, gives us the
     * tools to do the port, but it's extra work I'm not going to bother with for
     * now.
     *   -trs, 23 April 2025
     */
    versions: [
      ...tags,
      repo.default_branch,

      /* Don't list other branches (at least for now?) under the assumption
       * that they are primarily for development, short-lived, and not
       * something we'd typically want to expose in a UI.
       */
    ]
  });
}


export const getVersion = contentTypesProvided([
  ["application/json", versionJSON],
  ["application/zip", versionZIP],
  ["text/html", versionHTML]
]);


async function versionJSON(req, res) {
  const {name, version, revision} = await resolveVersion(req);

  /* We can add other version-specific metadata like created/released timestamp
   * or nextstrain-pathogen.yaml registration info as needed.
   *   -trs, 22 April 2025
   */
  return res.json({
    name,
    version,
    revision,
  });
}


async function versionZIP(req, res) {
  const {name, revision} = await resolveVersion(req);

  // Use revision instead of version to avoid race conditions/inconsistent resolution.
  return res.redirect(uri`https://api.github.com/repos/nextstrain/${name}/zipball/${revision}`);
}


async function versionHTML(req, res) {
  const {name, revision} = await resolveVersion(req);
  return res.redirect(uri`https://github.com/nextstrain/${name}/tree/${revision}`);
}


async function resolveVersion(req) {
  const name = req.params.name;
  const version = req.params.version;
  if (!name || !version) throw new BadRequest();

  const commit = await fetch(
    uri`https://api.github.com/repos/nextstrain/${name}/commits/${version}`,
    {headers: {...headers, Accept: "application/vnd.github.sha"}}
  );

  switch (commit.status) {
    case 200:
      break;

    case 404:
    case 422: // status for a bad version/commit
      throw new NotFound();

    default:
      throw new InternalServerError(`upstream said: ${commit.status} ${commit.statusText}`);
  }

  const revision = await commit.text();

  /* Our versioning model for pathogen repos is to support both mutable named
   * versions (e.g. 1.2.3, v42, main) which might resolve differently at
   * different times and immutable revision ids (e.g.
   * abadcafefeedfacebadc0ffee0ddf00ddeadd00d) which won't (i.e.
   * content-addressed versions).
   *
   * We accomplish this currently with Git refs (tags, branches) and commit ids
   * (SHAs), but other storage implementations are possible too.
   */
  return {
    name,
    version,
    revision,
  };
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
