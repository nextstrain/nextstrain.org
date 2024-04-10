import * as endpoints from '../endpoints/index.js';

export async function setup(app) {
  app.routeAsync("*")
    .getAsync(endpoints.nextJsApp.handleRequest);
}