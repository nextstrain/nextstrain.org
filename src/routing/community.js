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
  CommunitySource,
} = sources;


export function setup(app) {
  app.use(["/community/narratives/:user/:repo", "/community/:user/:repo"],
    setSource(req => new CommunitySource(req.params.user, req.params.repo)));

  /* Unlike other dataset and narrative routes, /community/:user/:repo and
   * /community/narratives/:user/:repo can go to either Auspice or Next.JS,
   * depending on the existence of a top-level dataset or narrative file.  The
   * two cases depend on the existence of a dataset file named auspice/:repo.json
   * or narrative file in narratives/:repo.md in the GitHub :user/:repo.
   *
   * If it exists, Auspice's entrypoint is sent (for HTML-accepting requests).
   *
   * If it doesn't exist, a NotFound (404) error is raised and (for HTML-accepting
   * requests) we hand control to the Next.JS app. This is not aware of the
   * NotFound error and will display the matching page for community. Within that
   * page (client-side code) we inspect the URL path and display an appropriate
   * error banner.
   */
  app.routeAsync(["/community/narratives/:user/:repo", "/community/narratives/:user/:repo/*"])
    .all(setNarrative(req => req.params[0]))
    .getAsync(getNarrative)
    .optionsAsync(optionsNarrative)
  ;

  app.routeAsync(["/community/:user/:repo", "/community/:user/:repo/*"])
    .all(setDataset(req => req.params[0]))
    .getAsync(getDataset)
    .optionsAsync(optionsDataset)
  ;
}
