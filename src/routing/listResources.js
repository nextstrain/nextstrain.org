import {listResources} from '../endpoints/index.js';

/**
 * Adds the API endpoints to the express router to handle list-resources GET
 * requests. Note that depending on what the request's 'Accept' value the
 * endpoint may simply pass the request to the next handler - see the endpoint
 * for details.
 *
 * The current API address should be considered "beta" and there is a loud
 * warning message included in the response indicating this.
 */
export function setup(app) {
  app.routeAsync("/list-resources/:page")
    .getAsync(listResources.listResources);
}