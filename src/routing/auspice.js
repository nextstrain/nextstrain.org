import * as endpoints from '../endpoints/index.js';
import { NotFound } from '../httpErrors.js';


/** Set up routes for Auspice HTML pages and assets.
 */
export function setup(app) {

  /* Auspice hardcodes URL paths that start with /dist/… in its Webpack config,
   * so we must use that prefix here too.
   */
  app.route("/dist/*")
    .all(endpoints.auspice.auspiceAssets, (req, res, next) => next(new NotFound()));

  /* Auspice has a special /edit/narratives route -
   * It is not backed by a dataset, and only exists for GET requests
   */
  app.routeAsync("/edit/narratives")
    .getAsync(endpoints.auspice.sendAuspiceEntrypoint);
}
