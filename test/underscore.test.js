/* eslint-disable no-multi-spaces */

/* Rationale:
 *   no-multi-spaces: Aligned paths make for easier reading
 */

// const {parse: parseContentType} = require("content-type");
const fetch = require("node-fetch");
const fs = require("fs");

const gatsby404 = fs.readFileSync("static-site/public/404.html").toString();

/* Tests for issue #432, where we would like to reject dataset paths that contain
 * underscores. This test set could be merged into requests.test.js but I
 * kept it separate for now because many of those tests need to be run on the
 * server or require the AWS credentials. These tests only use the public
 * flu dataset (which is why it is a small test suite), but should be able
 * to be run by any developer.
 *   -sk, 15 Apr 2022
 */

/* Set a lenient timeout of 15s as these depend on remote/upstream servers
 * which might be slow to respond at times and/or network might be slow.
 */
jest.setTimeout(15000);


describe(`test underscores`, () => {

  const cases = [
    {case: "error", path: "/groups/blab/ncov_early-outbreak_root-A", expected: 404},
    {case: "error", path: "/flu/seasonal/h3n2_ha_2y", expected: 404},
    {case: "success", path: "/flu/seasonal/h3n2/ha/2y", expected: 200}
  ];

  cases.forEach(testPath);

  function testPath({case: case_, path, expected}) {
    describe(case_, () => {
      const req = fetch(url(path), accept("text/html,*/*;q=0.1"));


      test(`TESTING UNDERSCORE ${path}`, async () => {
        const res = await req;
        expect(res.status).toBe(expected);
      });

      test(`TESTING BODY ${path}`, async () => {
        const res = await req;
        const body = await res.text();
        if (expected !== 404) {
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
