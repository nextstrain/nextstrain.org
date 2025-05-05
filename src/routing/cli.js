import * as analytics from '../analytics.js';
import * as endpoints from '../endpoints/index.js';


export function setup(app) {
  app.useAsync("/cli", analytics.recordEvent());

  app.routeAsync("/cli/download/:version/:assetSuffix")
    .getAsync(endpoints.cli.download);

  app.routeAsync("/cli/download/pr-build/:prId/:assetSuffix")
    .getAsync(endpoints.cli.downloadPRBuild);

  app.routeAsync("/cli/download/ci-build/:runId/:assetSuffix")
    .getAsync(endpoints.cli.downloadCIBuild);

  app.routeAsync("/cli/installer/:os")
    .getAsync(endpoints.cli.installer);

  app.routeAsync("/cli")
    .getAsync(endpoints.cli.info);
}
