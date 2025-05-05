import * as analytics from '../analytics.js';
import * as endpoints from '../endpoints/index.js';


export function setup(app) {
  app.useAsync("/pathogen-repos", analytics.recordEvent());

  app.routeAsync("/pathogen-repos/:name/versions")
    .getAsync(endpoints.pathogenRepos.listVersions);

  app.routeAsync("/pathogen-repos/:name/versions/:version")
    .getAsync(endpoints.pathogenRepos.getVersion);
}
