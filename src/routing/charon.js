import cors from 'cors';
import { PRODUCTION } from '../config.js';
import * as endpoints from '../endpoints/index.js';
import * as utils from '../utils/index.js';
import { NotFound } from '../httpErrors.js';


/** Define the Charon API routes.
 */
export async function setup(app) {
  if (!PRODUCTION) {
    // allow cross-origin from the gatsby dev server
    app.use("/charon", cors({ origin: 'http://localhost:8000' }));
  }

  app.routeAsync("/charon/getAvailable")
    .getAsync(endpoints.charon.getAvailable);

  app.routeAsync("/charon/getDataset")
    .getAsync(
      endpoints.charon.setSourceFromPrefix,
      endpoints.charon.setDatasetFromPrefix,
      endpoints.charon.canonicalizeDatasetPrefix,
      endpoints.charon.getDataset);

  app.routeAsync("/charon/getNarrative")
    .getAsync(
      endpoints.charon.setSourceFromPrefix,
      endpoints.charon.setNarrativeFromPrefix,
      endpoints.charon.getNarrative);

  app.routeAsync("/charon/getSourceInfo")
    .getAsync(
      endpoints.charon.setSourceFromPrefix,
      endpoints.charon.getSourceInfo);

  app.routeAsync("/charon/*")
    .all((req) => {
      utils.warn(`(${req.method}) ${req.url} has not been handled / has no handler`);
      throw new NotFound();
    });
}
