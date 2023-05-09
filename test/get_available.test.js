import {jest} from '@jest/globals';
import fetch from 'node-fetch';

// As some of the APIs we're calling will themselves call  GitHub APIs
// we set a lenient timeout
jest.setTimeout(15000);


/**
 * We expect getAvailable data to, where possible, use the branch syntax in the
 * nextstrain URLs. For instance, if `@branch` is specified, then the data should
 * be returned in this format, even if it's the default branch.
 */
describe("getAvailable community URLs correctly interpret the GitHub branch", () => {
  const data = [
    {
      url: "/charon/getAvailable?prefix=/community/jameshadfield/scratch@test-branch",
      name: "Explicit non-default branch",
      branch: "test-branch"
    },
    {
      url: "/charon/getAvailable?prefix=/community/jameshadfield/scratch@master",
      name: "Explicit default branch",
      branch: "master"
    },
    {
      url: "/charon/getAvailable?prefix=/community/jameshadfield/scratch",
      name: "Implicit default branch",
      branch: undefined // use `undefined` to check that no explicit branch returned
    }
  ];
  for (const testCase of data) {
    it(testCase.name, async () => {
      const url = `${BASE_URL}${testCase.url}`;
      const res = await fetch(url, {redirect: 'manual'});
      expect(res.status).toEqual(200);
      const json = await res.json();
      const requests = [];
      if ("datasets" in json) {
        json.datasets.forEach((d) => requests.push(d.request));
      }
      if ("narratives" in json) {
        json.datasets.forEach((d) => requests.push(d.request));
      }
      const branches = new Set(requests.map((r) => parseBranchFromAddress(r)));
      expect(branches.size).toEqual(1);
      expect(branches).toContain(testCase.branch);
    });
  }
});


function parseBranchFromAddress(request) {
  const parts = request.split("/").filter((p) => !!p);
  expect(parts[0]==="community");
  parts.shift();
  if (parts[0]==="narratives") parts.shift();
  const m = parts[1].match(/(.+)@(.*)/);
  if (m===null) {
    return undefined;
  }
  return m[2];
}
