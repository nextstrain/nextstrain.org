import * as endpoints from '../endpoints/index.js';
import * as sources from '../sources/index.js';

const {
  setSource,
  setDataset,
  canonicalizeDataset,
  getDataset,
  optionsDataset,
} = endpoints.sources;

const {
  NextcladeSource,
} = sources;


export function setup(app) {
  app.use("/nextclade", setSource(req => new NextcladeSource())); // eslint-disable-line no-unused-vars

  app.routeAsync("/nextclade")
    .getAsync(endpoints.nextJsApp.handleRequest)
  ;

  app.routeAsync("/nextclade/*")
    .allAsync(setDataset(req => req.params[0]), canonicalizeDataset(path => `/nextclade/${path}`))
    .getAsync(getDataset)
    .optionsAsync(optionsDataset)
  ;
}
