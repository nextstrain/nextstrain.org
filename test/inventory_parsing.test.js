/**
 * Tests our handling of delete markers during construction of the resource index
 */

import { parseInventory } from '../resourceIndexer/inventory.js';
import { remapCoreUrl } from '../resourceIndexer/coreUrlRemapping.js';

/**
 * Following is all the versions for s3://nextstrain-data/zika_meta.json as of
 * January 2024, taken directly from the inventory. The order is unchanged, but
 * in this case all items except the first are chronological.
 */
const zika_meta = [
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2018-07-18T19:17:48.000Z", ETag: "a62ca3db012aab995aba66ac48421020"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "yw1HMWq1CxxJBxLhshhd83QmfWiooRP0",IsLatest: "true", IsDeleteMarker: "false", LastModifiedDate: "2023-05-20T01:48:18.000Z", ETag: "711e4fc15f0c16c58e9a0d1262895553"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "K.kzHAimpImiTUdyBX.EBpRTIedPDCK2",IsLatest: "false", IsDeleteMarker: "true", LastModifiedDate: "2019-11-08T21:07:14.000Z", ETag: ""},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "M7wNtFHS.iPQvEVNRfbvUjk8j1iV3G8H",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2019-09-04T19:55:09.000Z", ETag: "0412951533dcdadfa3981f57e6b39579"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "TPkaMuRION0i5IWhCMwzwm9R21UVjhSO",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2019-05-26T20:52:25.000Z", ETag: "df39017298c469f123898e7963d7f973"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "wWs5NO6cVRJKXXNm9nYlOKDgJkDU7iuk",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2019-05-26T20:22:13.000Z", ETag: "621e662cd518bfbe8c1fa2ae98e8e84e"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "dXQ7RKthkKu4puoY5vMAFsOJBqg1zF42",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2018-12-05T23:29:28.000Z", ETag: "333b61eba337428c31cf7903454c36fa"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "tDx7r51clfnWOpDNAa.1aZsrF0BGSGbE",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2018-11-21T00:06:08.000Z", ETag: "572f84a28deffcfe1b0a81cf8afb05ab"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "9Djm_Ug3pAZXP9m5h2FGAxQeQuAtOSHg",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2018-10-29T16:04:49.000Z", ETag: "d9673eed4000c4156058141d6b95ccf9"},
  {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "YaEy2NzJM_QmLONaIv1Iui2BvDLCoEK9",IsLatest: "false", IsDeleteMarker: "false", LastModifiedDate: "2018-08-04T16:35:59.000Z", ETag: "84864d5c92d456d869130ec8df1c73ea"},
]

test('parsing of nextstrain-data/zika_meta.json inventory', async () => {
  // el[0] is dropped -- no version ID in a versioned bucket
  // el[2] is dropped -- delete marker
  // el[3] is dropped -- deleted by the delete marker
  const should_be = [zika_meta[1], ...zika_meta.slice(4)]
  const parsed = await parseInventory({objects: zika_meta, versionsExist: true})
  expect(parsed.map((el) => el.versionId))
    .toEqual(should_be.map((el) => el.VersionId))

  const shuffled = await parseInventory({objects: shuffle(zika_meta), versionsExist: true})
  expect(shuffled.map((el) => el.versionId))
    .toEqual(should_be.map((el) => el.VersionId))  
})

test('back-to-back delete markers', async () => {
  const test_data = zika_meta.slice()
  test_data.splice(7, 0, {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "introduced-marker-1",IsLatest: "false", IsDeleteMarker: "true", LastModifiedDate: "2018-12-02T12:00:00.000Z", ETag: "123"});
  test_data.splice(8, 0, {Bucket: "nextstrain-data", Key: "zika_meta.json", VersionId: "introduced-marker-2",IsLatest: "false", IsDeleteMarker: "true", LastModifiedDate: "2018-12-01T12:00:00.000Z", ETag: "456"});
  const should_be = [zika_meta[1], ...zika_meta.slice(4,7), ...zika_meta.slice(8)]
  const parsed = await parseInventory({objects: test_data, versionsExist: true})
  expect(parsed.map((el) => el.versionId))
    .toEqual(should_be.map((el) => el.VersionId))

  const shuffled = await parseInventory({objects: shuffle(test_data), versionsExist: true})
    expect(shuffled.map((el) => el.versionId))
      .toEqual(should_be.map((el) => el.VersionId))   
})

/**
 * Core URL remapping involves the (committed) `manifest_core.json` and our
 * parsing of that file in the server code
 * `convertManifestJsonToAvailableDatasetList`, as well as some resource indexer
 * specific code. Adding some simple sanity tests here guards against
 * inadvertent changes.
 */
test('core URL redirects (via our manifest) are correctly obtained', async () => {
  const expected_url_redirects = {
    'dengue/denv1': 'dengue/denv1/genome',
    WNV: 'WNV/all-lineages',
    'seasonal-flu': 'seasonal-flu/h3n2/ha/2y',
    'seasonal-flu/h3n2': 'seasonal-flu/h3n2/ha/2y',
    'seasonal-flu/h3n2/ha': 'seasonal-flu/h3n2/ha/2y',
  }
  Object.entries(expected_url_redirects).forEach(([from, to]) => {
    expect(remapCoreUrl(from)).toEqual(to);
  })
})


function shuffle(arr) {
  // following is not truly random, but good enough
  return arr.slice().sort(() => 0.5-Math.random());
}
