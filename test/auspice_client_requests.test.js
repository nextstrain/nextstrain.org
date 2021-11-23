
const urlsToTest = require("./auspice_client_requests.json");
const fetch = require('node-fetch');

// As some of the APIs we're calling will themselves call  GitHub APIs
// we set a lenient timeout
jest.setTimeout(15000);

describe("smoke testing URLs described in auspice_client_requests.json", () => {
  for (const testCase of urlsToTest) {
    // eslint-disable-next-line no-loop-func
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
  if (res.status!==302) {
    throw Error(`Test asked to check redirect address, but statusCode wasn't 302`);
  }
  expect(res.headers.get("Location")).toEqual(expectedRedirectAddress);
}
