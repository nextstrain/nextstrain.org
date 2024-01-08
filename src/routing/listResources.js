import {listResources} from '../endpoints/index.js';

/**
 * Adds the API endpoints to the express router to handle list-resources GET
 * requests
 * 
 * TODO: restrict this to JSON content so that users can't accidentally point
 * a browser to this "dataset"
 * 
 * One design would be to change the _pages_ which are requesting this data to be
 * accept specific, e.g.
 * /pathogens (accept: JSON) -> JSON response of data
 * /pathogens (accept: HTML) -> Gatsby
 */
export function setup(app) {
  app.routeAsync("/list-resources")
    .getAsync(listResources.send);
}