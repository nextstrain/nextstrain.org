import * as endpoints from '../endpoints/index.js';


export function setup(app) {
  app.routeAsync("/pathogen-repos/:name/versions")
    .getAsync(endpoints.pathogenRepos.listVersions);

  app.routeAsync("/pathogen-repos/:name/versions/:version")
    .getAsync(endpoints.pathogenRepos.getVersion);
}
