/**
 * Example dev use:
 * run the server in a separate process via:
 * RESOURCE_INDEX="./test/date_descriptor_index.json" node server.js --verbose
 * Then run this test file via:
 * NODE_OPTIONS='--experimental-vm-modules' npx jest test/list-resources.test.js
 */

import fetch from 'node-fetch';

const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const OK = 200;

describe("Routes are correctly routed", () => {

  const routes = [
    ['list-resources/core', OK], // PS no staging data in test/date_descriptor_index.json
    ['list-resources', BAD_REQUEST],
    ['list-resources/', BAD_REQUEST],
    ['list-resources/core/foo', BAD_REQUEST],
    ['list-resources/foo', NOT_FOUND],
  ]

  for (const [path, code] of routes) {
    for (const trailing of ['', '/']) {
      const p = path + trailing;
      it(`Route for ${p}`, async () => {
        const res = await fetchJson(`${BASE_URL}/${p}`);
      expect(res.status).toEqual(code);
      if (code===OK) {
          expect(res.headers.get('Content-Type')).toMatch('application/json')
        }
      })
    }
  }
})

async function fetchJson(url) {
  // The Content-Type indicates to the server the format of the request data.
  // The Accept header specifies the desired response format.
  return await fetch(url, {
    method: 'GET',
    headers: {Accept: 'application/json'},
    redirect: 'manual'
  });
}