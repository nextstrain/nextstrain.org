/* eslint-disable no-multi-spaces */

/* Rationale:
 *   no-multi-spaces: Aligned paths make for easier reading
 */

const fetch = require("node-fetch");
const fs = require("fs");

const auspiceEntrypoint = fs.readFileSync("auspice-client/dist/index.html").toString();
const gatsby404 = fs.readFileSync("static-site/public/404.html").toString();

/* It would be better if none of these tests relied on actual production
 * datasets/narratives and instead solely used fixtures explicitly put in place
 * for testing (like the nextstrain/community-test repo).  However, it is not
 * just a matter of uploading fixtures to our various sources, as then they'll
 * automatically show up in listings of dataset, narratives, groups, etc.  We
 * don't currently have a way to mark things as "hidden", and adding a way is
 * not a tangent I want to embark on right now.
 *
 * Until then, this test file may be a bit more fragile than is ideal, but it
 * should still be better than not testing.
 *   -trs, 23 Nov 2021
 */

/* Set a lenient timeout of 15s as these depend on remote/upstream servers
 * which might be slow to respond at times and/or network might be slow.
 */
jest.setTimeout(15000);

describe("datasets", () => {

  describe("core", () => {
    testPath("nested",        "/flu/seasonal/h3n2/ha/2y");
    testPath("canonicalized", "/flu/seasonal");
    testPath("top-level",     "/zika");
  });

  describe("staging", () => {
    testPath("nested",        "/staging/flu/seasonal/h3n2/ha/2y");
    testPath("canonicalized", "/staging/flu/seasonal");
    testPath("top-level",     "/staging/zika");
  });

  describe("community", () => {
    testPath("nested",     "/community/nextstrain/community-test/zika/tutorial");
    testPath("top-level",  "/community/nextstrain/community-test@top-level");
    testPath("alt branch", "/community/nextstrain/community-test@alt/beta-cov");
    describe("bogus", () => {
      testGatsby404("/community/nextstrain/community-test@does-not-exist");
      testGatsby404("/community/nextstrain/does-not-exist");
    });
  });

  describe("groups", () => {
    testPath("nested",    "/groups/blab/ncov/19B");
    testPath("top-level", "/groups/blab/beta-cov");
    describe("bogus", () => {
      testGatsby404("/groups/blab/does-not-exist");
      testGatsby404("/groups/does-not-exist");
    });
  });

  describe("fetch", () => {
    testPath("with extension",    "/fetch/github.com/nextstrain/community-test/raw/master/auspice/community-test_zika_tutorial.json", false);
    testPath("without extension", "/fetch/github.com/nextstrain/community-test/raw/master/auspice/community-test_zika_tutorial", false);
  });

});

describe("narratives", () => {

  describe("core", () => {
    testPath("top-level", "/narratives/intro-to-narratives");
    testPath("nested",    "/narratives/ncov/sit-rep/2020-08-14");
  });

  describe("staging", () => {
    testPath("top-level", "/staging/narratives/intro-to-narratives");
    testPath("nested",    "/staging/narratives/test/fixture/intro-to-narratives");
  });

  describe("community", () => {
    testPath("nested",     "/community/narratives/nextstrain/community-test/intro-to-narratives");
    testPath("top-level",  "/community/narratives/nextstrain/community-test@top-level");
    testPath("alt branch", "/community/narratives/nextstrain/community-test@alt/alternate-branch");
    describe("bad branch", () => {
      testGatsby404("/community/narratives/nextstrain/community-test@does-not-exist");
    });
  });

  describe("groups", () => {
    testPath("nested", "/groups/blab/narratives/test/fixture");
    describe("bogus", () => {
      testGatsby404("/groups/blab/narratives/does-not-exist");
    });
  });

  describe("fetch", () => {
    testPath("with extension", "/fetch/narratives/github.com/nextstrain/community-test/raw/master/narratives/community-test_intro-to-narratives.md", false);
  });

});

function testPath(reason, path, test404 = true) {
  describe(reason, () => {
    test(`${path} sends Auspice`, async () => {
      const res = await fetch(url(path));

      expect(res.status).toBe(200);
      expect(await res.text()).toBe(auspiceEntrypoint);
    });

    if (test404) testGatsby404(`${path}/does-not-exist`);
  });
}

function testGatsby404(path) {
  test(`${path} sends Gatsby 404`, async () => {
    const res = await fetch(url(path));

    expect(res.status).toBe(404);
    expect(await res.text()).toBe(gatsby404);
  });
}

function url(path) {
  return new URL(path, BASE_URL);
}
