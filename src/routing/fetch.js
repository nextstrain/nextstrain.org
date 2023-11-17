import * as endpoints from '../endpoints/index.js';
import * as sources from '../sources/index.js';

const {
  setSource,
  setDataset,
  setNarrative,
  getDataset,
  optionsDataset,
  getNarrative,
  optionsNarrative,
} = endpoints.sources;

const {
  UrlDefinedSource,
} = sources;

export function setup(app) {
  app.use(["/fetch/narratives/:authority", "/fetch/:authority"],
    setSource(req => new UrlDefinedSource(req.params.authority)));

  app.routeAsync("/fetch/narratives/:authority/*")
    .all(setNarrative(req => req.params[0]))
    .getAsync(getNarrative)
    .optionsAsync(optionsNarrative)
  ;

  app.routeAsync("/fetch/:authority/*")
    .all(setDataset(req => req.params[0]))
    .getAsync(getDataset)
    .optionsAsync(optionsDataset)
  ;
}
