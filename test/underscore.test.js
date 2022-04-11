/* eslint-disable no-multi-spaces */

/* Rationale:
 *   no-multi-spaces: Aligned paths make for easier reading
 */

// const {parse: parseContentType} = require("content-type");
const fetch = require("node-fetch");
const fs = require("fs");

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


describe(`test underscores`, () => {

  const cases = [
    {case: "error", path: "/groups/blab/ncov_early-outbreak_root-A", expected: 404},
    {case: "error", path: "/flu/seasonal/h3n2_ha_2y", expected: 404},
    {case: "success", path: "/groups/blab/ncov-early-outbreak-root-A", expected: 200},
    {case: "success", path: "/flu/seasonal/h3n2/ha/2yA", expected: 200}
  ];

  cases.forEach(testPath);

  function testPath({case: case_, path, expected}) {
    describe(case_, () => {
      const req = fetch(url(path), accept("text/html,*/*;q=0.1"));


      test(`TESTING UNDERSCORE ${case_}`, async () => {
        const res = await req;
        expect(res.status).toBe(expected);
      });

      test(`TESTING BODY ${case_}`, async () => {
        const res = await req;
        const body = await res.text();
        if (expected == 404) {
          expect(body).toBe(gatsby404);
        } else {
          expect(body).not.toBe(gatsby404);
        }
      });
    });
  }


});


function url(path) {
  return new URL(path, BASE_URL);
}

function accept(mediaType) {
  return {
    headers: {
      Accept: mediaType
    }
  };
}
