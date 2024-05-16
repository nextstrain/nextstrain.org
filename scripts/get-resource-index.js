/**
 * Bare bones script to get the `RESOURCE_INDEX` from the config module
 *
 * This does not address the edge case of the config.RESOURCE_INDEX in the live
 * server being different than the config.RESOURCE_INDEX in GitHub Actions, which can
 * happen if we set the `RESOURCE_INDEX` envvar on in Heroku.
 *
 * We can improve on this in the future by surfacing the deployment metadata
 * from our servers via our own API endpoint as suggested by @tsibley in
 * <https://github.com/nextstrain/nextstrain.org/pull/841#discussion_r1588227761>
 */

import { RESOURCE_INDEX } from '../src/config.js';


function main() {
  console.log(RESOURCE_INDEX)
}

main();
