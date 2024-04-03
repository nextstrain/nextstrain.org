import {listResources} from '../endpoints/index.js';

/**
 * Adds the API endpoints to the express router to handle list-resources GET
 * requests. Note that depending on what the request's 'Accept' value the
 * endpoint may simply pass the request to the next handler - see the endpoint
 * for details.
 *
 * The current route should be considered "beta" and there is a loud warning
 * message included in the response indicating this. In its current form it
 * requires a single source name ('core', 'staging') in the route, however a
 * future API may not want to couple the route + source (e.g. we may have a
 * resource listing using data from multiple sources). See 
 * <https://github.com/nextstrain/nextstrain.org/pull/803#discussion_r1546843937>
 * for some discussion about route name choices.
 */
export function setup(app) {
  app.routeAsync("/list-resources/:sourceName")
    .getAsync(listResources.listResources);
}