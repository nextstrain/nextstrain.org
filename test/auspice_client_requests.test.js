import {jest} from '@jest/globals';
import fetch from 'node-fetch';
import urlsToTest from './auspice_client_requests.json';

// As some of the APIs we're calling will themselves call  GitHub APIs
// we set a lenient timeout
jest.setTimeout(15000);

describe("smoke testing URLs described in auspice_client_requests.json", () => {
  for (const testCase of urlsToTest) {
    it(testCase.name, async () => {
      const url = `${BASE_URL}${testCase.url}`;
      const res = await fetch(url, {redirect: 'manual'});

      expect(res.status).toEqual(testCase.expectStatusCode || 200);

      if (testCase.responseIsJson) await testResponseIsJson(res);

      // If the test specifies a redirect, test that the header points to this
      if (testCase.redirectsTo) testRedirect(res, `${BASE_URL}${testCase.redirectsTo}`);

    });
  }
});

async function testResponseIsJson(res) {
  // to-do: can we use `expect` here? e.g. expect(async () => {await res.json();}).not.toThrow();
  try {
    await res.json();
  } catch (e) {
    throw Error(`Response wasn't JSON!`);
  }
}

function testRedirect(res, expectedRedirectAddress) {
  const validStatuses = new Set([301, 302, 303, 307, 308]);
  if (!validStatuses.has(res.status)) {
    throw Error(`Test asked to check redirect address, but statusCode wasn't one of: ${[...validStatuses].join(" ")}`);
  }
  expect(res.headers.get("Location")).toEqual(expectedRedirectAddress);
}
