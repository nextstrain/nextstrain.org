/**
 *
 * Testing of requests made using URLs with date descriptors (i.e. @YYYY-MM-DD).
 * It would be better if we also ran the server from the test process and could
 * spy on the requests being made to check the correct versionId is being used
 * in the requests to AWS.
 *
 */

/**
 * Example dev use:
 * run the server in a separate process via:
 * RESOURCE_INDEX="./test/date_descriptor_index.json" node server.js --verbose
 * Then run this test file via:
 * NODE_OPTIONS='--experimental-vm-modules' npx jest test/date_descriptor.test.js
 */

/* eslint no-prototype-builtins: 0 */

import fetch from 'node-fetch';
import {jest} from '@jest/globals';

// As some of the APIs we're calling will themselves call GitHub APIs,
// or will request v1 JSONs which are slow, we set a lenient timeout
jest.setTimeout(15000);

const BAD_REQUEST = 400;
const NOT_FOUND = 404;

const coreDataZika = [
  /**
   * 2023-02-21 maps to a valid dataset, uploaded that same day. Main dataset
   * version ID: xSaqFeCujRdPmjuYx_MEO8gETcvX9xfC. The JSON upload date is
   * 2023-02-16. This version does have a root-sequence sidecar.
   */
  {prefix: 'zika@2023-02-21', valid: true, jsonUpdatedDate: '2023-02-16'},
  {prefix: 'zika@2023-02-21', sidecar: 'root-sequence', valid: true},
  /**
   * 2022-11-01 should access the datestamp object 2022-10-05 which is
   * zika.json?versionId=cQV2g9_MA5eIWOvzsgwjTjJnMsaaB0hu, which has a "updated"
   * date in the json of 2022-09-30. Objects from this day do not have any
   * sidecars.
   */
  {prefix: 'zika@2022-11-01', valid: true, jsonUpdatedDate: '2022-09-30'},
  {prefix: 'zika@2022-11-01', sidecar: 'root-sequence', valid: false, errorMessage: 'This version of the resource does not have a subresource for root-sequence'},
  /**
   * The earliest dataset in the current index is 2022-08-01, so anything before should 404
   */
  {prefix: 'zika@2022-01-01', valid: false, errorMessage: 'Version descriptor 2022-01-01 predates available versions'},
]

const coreDataWNV = [
  /* most recent dataset is datestamped 2019-10-30 and is a v1 meta+tree dataset. No sidecars.
     Note that this can take around 10 seconds as both v1 files are fetched then converted server-side
     the RESTful API doesn't handle v1 datasets (and probably never will). */
  {prefix: 'WNV/NA@2020-11-17', REST: false, valid: true, jsonUpdatedDate: "30 Oct 2019"},
  {prefix: 'WNV/NA@2020-11-17', REST: false, valid: false, sidecar: 'root-sequence', errorMessage: 'This version of the resource does not have a subresource for root-sequence'},
  // Following should map to the v2 dataset with timestamp 2020-11-18. version id: 7lRiCIu.cP5RTZkm7m7kPSvo6GbD846H. No sidecars
  {prefix: 'WNV/NA@2021-01-01', valid: true, jsonUpdatedDate: "2020-11-10"},
  {prefix: 'WNV/NA@2021-01-01', valid: false, sidecar: 'root-sequence', errorMessage: 'This version of the resource does not have a subresource for root-sequence'},
  // Following is _more recent_ than the most recent dataset in the index so we _do not_ make a versioned request, we simply access the latest file
  // As of 2024-01-03 we don't have a sidecar file (so it'll 404) we might in the future...
  {prefix: 'WNV/NA@2024-01-03', valid: true},
]

const nonCoreData = [
  {prefix: 'staging/zika@2023-02-21', valid: false, errorCode: BAD_REQUEST, errorMessage: notHandledError('2023-02-21')},
  {prefix: 'groups/blab/beta-cov@2023-02-21', valid: false, errorCode: BAD_REQUEST, errorMessage: notHandledError('2023-02-21')},
  /* Community URLs can't have version descriptors, but they can have 'repo@commit' syntax */
  {prefix: 'community/blab/ebola-narrative-ms/subsampled/3', valid: true},
  {prefix: 'community/blab/ebola-narrative-ms/subsampled/3@2023-01-01', valid: false, errorCode: BAD_REQUEST, errorMessage: notHandledError('2023-01-01')},
  {prefix: 'community/blab/ebola-narrative-ms@cdacef9/subsampled/3', valid: true},
  {prefix: 'community/blab/ebola-narrative-ms@cdacef9/subsampled/3@2023-01-01', valid: false, errorCode: BAD_REQUEST, errorMessage: notHandledError('2023-01-01')},
  {prefix: 'fetch/data.nextstrain.org/zika.json', valid: true},
  /**
   * '@' characters are just fine within a fetch dataset, it's the one exception to the rule.
   * Note 1: this is a 404, because the fetched file doesn't exist, but it's not a BAD_REQUEST
   * Note 2: we skip the RESTful call for text/html because it returns 200 - this is a bug which predates the
   *         version descriptors as it's also present for, e.g. 'fetch/data.nextstrain.org/zika.something.json'.
   *         Loading the page will still end up with a 404-like error page, so the bug is very minor.
   */
  {prefix: 'fetch/data.nextstrain.org/zika@something.json', valid: false, REST_HTML: false, errorCode: NOT_FOUND, errorMessage: "Not Found"},
]

const malformedDateDescriptorData = [
  // Note that datasets like "zika@" (i.e. an empty string date descriptor) are actually considered ok
  {prefix: 'zika@6m', valid: false, errorCode: BAD_REQUEST, errorMessage: 'Requested version must be in YYYY-MM-DD format (version descriptor requested: "6m")'},
  {prefix: 'zika@2023-02-01@huh', valid: false, errorCode: BAD_REQUEST, errorMessage: 'Requested version must be in YYYY-MM-DD format (version descriptor requested: "2023-02-01@huh")'},
]


const datasets = [
  ...coreDataZika,
  ...coreDataWNV,
  ...nonCoreData,
  ...malformedDateDescriptorData,
]

/** Currently _all_ narratives with a version descriptor should return BadRequest */
const narratives = [
  {prefix: 'narratives/inrb-ebola-example-sit-rep', valid: true},
  {prefix: 'narratives/inrb-ebola-example-sit-rep@2023-01-01', valid: false, errorCode: BAD_REQUEST, errorMessage: notHandledError('2023-01-01')},
  {prefix: 'groups/blab/narratives/test/fixture@2023-01-01', valid: false, errorCode: BAD_REQUEST, errorMessage: notHandledError('2023-01-01')},
  /* Note that community URLs result in a request to `https://api.github.com/repos/${this.owner}/${this.repoName}` from the Source class constructor,
  which means that testing will make many requests to this. Fortunately, most will be a simple cache revalidation. */
  {prefix: 'community/narratives/blab/ebola-narrative-ms/2019-09-13-sit-rep-ENGLISH@2023-01-01', valid: false, errorCode: BAD_REQUEST, errorMessage: notHandledError('2023-01-01')},
  /* Community URLs with a 'repo@commit' structure should continue to work */
  {prefix: 'community/narratives/blab/ebola-narrative-ms@cdacef9/2019-09-13-sit-rep-ENGLISH', REST: false, valid: true}, // FIXME FIXME XXX
  /* See the note above in nonCoreData regarding fetch URLs */
  {prefix: 'fetch/narratives/data.nextstrain.org/does/not_exist@so_@this/should/404', valid: false, REST_HTML: false, errorCode: NOT_FOUND, errorMessage: "Not Found"},
]


describe("Request valid main datasets", () => {

  for (const d of datasets.filter((el) => !el.hasOwnProperty('sidecar') && el.valid===true)) {

    if (d.charon!==false) {
      it(`Charon API using ${d.prefix}`, async () => {
        const url = `${BASE_URL}/charon/getDataset?prefix=${d.prefix}`;
        const res = await fetch(url, {redirect: 'manual'});

        expect(res.status).toEqual(200);

        const dataset = await res.json();

        /* What we actually want to test is that the server fetched the
        AWS URL with the correct versionId, but since we aren't observing
        that we do the next best thing */
        if (d.jsonUpdatedDate) {
          expect(dataset.meta.updated).toEqual(d.jsonUpdatedDate);
        }
      });
    }

    /* some APIs are not implemented in REST (e.g. v1 JSONs) */
    if (d.REST===false) continue;

    it(`REST API using ${d.prefix}`, async () => {
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'json');
      expect(res.status).toEqual(200);
      const dataset = await res.json();
      if (d.jsonUpdatedDate) {
        expect(dataset.meta.updated).toEqual(d.jsonUpdatedDate);
      }
    })

    it(`REST API for ${d.prefix} (HTML content)`, async () => {
      /* should send the auspice entrypoint */
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'html');
      expect(res.status).toEqual(200);
      expect(res.headers.get('Content-Type')).toMatch('text/html')
    })
  }
})


describe("Invalid main datasets", () => {

  for (const d of datasets.filter((el) => !el.hasOwnProperty('sidecar') && el.valid!==true)) {

    if (d.charon!==false) {
      it(`Charon API using ${d.prefix}`, async () => {
        const res = await fetch(`${BASE_URL}/charon/getDataset?prefix=${d.prefix}`, {redirect: 'manual'});
        expect(res.status).toEqual(d.errorCode || NOT_FOUND);
        const errors = await res.json();
        expect(errors.error).toEqual(d.errorMessage)
      })
    }

    if (d.REST===false) continue;

    it(`REST API using ${d.prefix} (json content)`, async () => {
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'json');
      expect(res.status).toEqual(d.errorCode || NOT_FOUND);
      const errors = await res.json();
      expect(errors.error).toEqual(d.errorMessage)
    })

    if (d.REST_HTML===false) continue;

    it(`REST API for ${d.prefix} (HTML content)`, async () => {
      /* should send a gatsby page, but the error code will be the same */
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'html');
      expect(res.status).toEqual(d.errorCode || NOT_FOUND);
      expect(res.headers.get('Content-Type')).toMatch('text/html')
    })
  }
})


describe("Valid sidecars", () => {

  for (const d of datasets.filter((el) => el.hasOwnProperty('sidecar') && el.valid===true)) {

    if (d.charon!==false) {
      it(`Charon API using ${d.prefix} with sidecar ${d.sidecar}`, async () => {
        const url = `${BASE_URL}/charon/getDataset?prefix=${d.prefix}&type=${d.sidecar}`;
        const res = await fetch(url, {redirect: 'manual'});
        expect(res.status).toEqual(200);
        /* there's no way to check the sidecar is the one we expect unless we spied on the server
        requests, or fetched directly from AWS using the version ID and diffed the output */
      });
    }

    if (d.REST===false) continue;

    it(`REST API using ${d.prefix} asking for sidecar ${d.sidecar}`, async () => {
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, d.sidecar);
      expect(res.status).toEqual(200);
    })
  }
})


describe("Invalid sidecars", () => {

  for (const d of datasets.filter((el) => el.hasOwnProperty('sidecar') && el.valid!==true)) {

    if (d.charon!==false) {
      it(`Charon API using ${d.prefix} with sidecar ${d.sidecar}`, async () => {
        const url = `${BASE_URL}/charon/getDataset?prefix=${d.prefix}&type=${d.sidecar}`;
        const res = await fetch(url, {redirect: 'manual'});
        expect(res.status).toEqual(d.errorCode || NOT_FOUND);
        const errors = await res.json();
        expect(errors.error).toEqual(d.errorMessage)
      });
    }

    if (d.REST===false) continue;

    it(`REST API using ${d.prefix} asking for sidecar ${d.sidecar}`, async () => {
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, d.sidecar);
      expect(res.status).toEqual(d.errorCode || NOT_FOUND);
      const errors = await res.json();
      expect(errors.error).toEqual(d.errorMessage)
    })

  }
})

describe("Invalid narratives", () => {

  for (const d of narratives.filter((n) => !n.valid)) {

    if (d.charon!==false) {
      it(`Charon getNarrative API using ${d.prefix}`, async () => {
        const url = `${BASE_URL}/charon/getNarrative?prefix=${d.prefix}&type=md`;
        const res = await fetch(url, {redirect: 'manual'});
        expect(res.status).toEqual(d.errorCode || NOT_FOUND);
        const errors = await res.json();
        expect(errors.error).toEqual(d.errorMessage)
      });
    }

    if (d.REST===false) continue;

    it(`REST API for ${d.prefix} (markdown content)`, async () => {
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'narrative');
      expect(res.status).toEqual(d.errorCode || NOT_FOUND);
      const errors = await res.json();
      expect(errors.error).toEqual(d.errorMessage)
    })

    if (d.REST_HTML===false) continue;

    it(`REST API for ${d.prefix} (HTML content)`, async () => {
      /* should get a gatsby page, but the error code should be the same as for markdown requests */
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'html');
      expect(res.status).toEqual(d.errorCode || NOT_FOUND);
      expect(res.headers.get('Content-Type')).toMatch('text/html')
    })
  }
})

describe("Valid narratives", () => {

  for (const d of narratives.filter((n) => n.valid)) {

    if (d.charon!==false) {
      it(`Charon getNarrative API using ${d.prefix}`, async () => {
        const url = `${BASE_URL}/charon/getNarrative?prefix=${d.prefix}&type=md`;
        const res = await fetch(url, {redirect: 'manual'});
        expect(res.status).toEqual(200)
      });
    }

    if (d.REST===false) continue;

    it(`REST API for ${d.prefix} (markdown content)`, async () => {
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'narrative');
      expect(res.status).toEqual(200)
    })

    it(`REST API for ${d.prefix} (HTML content)`, async () => {
      /* should send the auspice entrypoint */
      const res = await fetchType(`${BASE_URL}/${d.prefix}`, 'html');
      expect(res.status).toEqual(200);
      expect(res.headers.get('Content-Type')).toMatch('text/html')
    })
  }
})

const redirects = [
  ["WNV", "WNV/all-lineages"],
  /* Note that WNV is not in the index, so this versioned test ensures we are
  not checking the existence/validity of any version descriptor against the WNV
  resource, rather we are redirecting and deferring those checks */
  ["WNV@2025-03-17", "WNV/all-lineages@2025-03-17"],
  /* URL queries should be preserved across the redirect, but only for the RESTful API */
  ["WNV@2025-03-17?c=region", "WNV/all-lineages@2025-03-17?c=region", {charon: false}],
  ["staging/WNV@2025-03-17?c=region", "staging/WNV/all-lineages@2025-03-17?c=region", {charon: false}],
]

describe("Paths redirect with version descriptors", () => {
  /* See <https://github.com/node-fetch/node-fetch#manual-redirect> for how
  fetch stores the redirect location when {redirect: 'manual'} */

  redirects.forEach(([fromUrl, toUrl, opts]) => {
    /* test RESTful API */
    (['html', 'json']).forEach((type) => {
      it(`REST API: ${fromUrl} goes to ${toUrl} (${type})`, async () => {
        const res = await fetchType(`${BASE_URL}/${fromUrl}`, type);
        expect(res.status).toEqual(307);
        expect(res.headers.get('location')).toEqual(`${BASE_URL}/${toUrl}`);
      })
    })


    /* test Charon API */
    if (opts?.charon === false) return;

    // Charon API datasets (prefix query) must not contain a query themselves
    it (`Charon prefix doesn't include query params`, () => {
      expect(fromUrl.includes('?')).toBeFalsy();
      expect(toUrl.includes('?')).toBeFalsy();
    })

    const charonUrl = (path, sidecar) =>
      `${BASE_URL}/charon/getDataset?prefix=${path}${sidecar ? `&type=root-sequence` : ''}`;

    /* note that the redirect URL of charon requests is constructed by creating
    a URL object (the RESTful API does not) which results in '/' and '@' being
    escaped in the query. This isn't necessary, but it's also fine to do so. */

    it(`Charon main dataset: ${fromUrl} goes to ${toUrl} `, async () => {
      const res = await fetch(charonUrl(fromUrl, false), {redirect: 'manual'});
      expect(res.status).toEqual(307);
      expect(decodeURIComponent(res.headers.get('location'))).toEqual(charonUrl(toUrl, false));
    })

    it(`Charon sidecar: ${fromUrl} goes to ${toUrl} `, async () => {
      const res = await fetch(charonUrl(fromUrl, true), {redirect: 'manual'});
      expect(res.status).toEqual(307);
      expect(decodeURIComponent(res.headers.get('location'))).toEqual(charonUrl(toUrl, true));
    })

  })

})


const redirectsRestOnly = [
  /* Following paths are redirected early on in our routing stack and doesn't involve
  any checking of the version provided */
  ["monkeypox/mpxv", "mpox/all-clades"],
  ["monkeypox/mpxv@anything", "mpox/all-clades@anything"]
]

describe("Paths redirect according to hardcoded top-level redirects", () => {
  redirectsRestOnly.forEach(([fromUrl, toUrl]) => {
    (['html', 'json']).forEach((type) => {
      it(`REST API: ${fromUrl} goes to ${toUrl} (${type})`, async () => {
        const res = await fetchType(`${BASE_URL}/${fromUrl}`, type);
        expect(res.status).toEqual(302); // res.redirect() has a default of 302
        expect(res.headers.get('location')).toEqual(`${BASE_URL}/${toUrl}`);
      })
    })
  })
})


/**
 * Map the sidecar names we use day-to-day to their content types
 * used within the server
 */
const ACCEPT_TYPES = {
  json: 'application/json',
  'root-sequence': 'application/vnd.nextstrain.dataset.root-sequence+json',
  'tip-frequencies': "application/vnd.nextstrain.dataset.tip-frequencies+json",
  measurements: "application/vnd.nextstrain.dataset.measurements+json",
  narrative: "text/markdown",
  html: "text/html",
}

async function fetchType(url, fileType) {
  // The Content-Type indicates to the server the format of the request data.
  // The Accept header specifies the desired response format.
  const acceptType = ACCEPT_TYPES[fileType];
  return await fetch(url, {
    method: 'GET',
    headers: {Accept: acceptType},
    redirect: 'manual'
  });
}

function notHandledError(d) {
  return `This resource cannot handle versioned dataset requests (version descriptor requested: "${d}")`
}
