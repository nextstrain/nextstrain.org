import * as authz from '../authz/index.js';
import { CoreSource } from './core.js';

/**
 * CollectedSources is a class which has access to all known resources
 * (narratives, datasets, files) for all known sources. Instances of this class
 * are used for requests for asset listings which may be within a single
 * source, or may span multiple sources.
 * 
 * The collection of assets is held in memory (via a closure) so that an
 * instance of CollectedSources can access this information to respond to
 * requests. The updating of the assets is deferred to each Source.
 * 
 */
const CollectedSources = (() => {

  const sources = new Map([
    ['core', new CoreSource()] // move to Symbol('core')?
    // TODO -- add core, all groups, fetch, community...
  ])

  sources.get('core').collectResources()

  // TODO XXX - collectResources() should be periodically run to update the sources.
  // the cadence of this updating somewhat depends on how we are collecting resources
  // (e.g. if the manifest updates daily, then we should re-collect daily). This could
  // be implemented here or, perhaps better, within the collectResources() method itself.

  class _CollectedSources {
    constructor(user) {
      this._user = user;
      this._sources = new Map(
        Array.from(sources)
          .filter(([, source]) => authz.authorized(user, authz.actions.Read, source))
      );
      console.log("CollectedSources() user has access to:", Array.from(this._sources).map((x) => x[0]).join(", "));
    }

    resources(filterOptions) {
      const resourcesByType = new Map();
      this._sources.forEach((source) => {

        if (filterOptions.source
          && (!(source instanceof filterOptions.source.constructor) || !(filterOptions.source instanceof source.constructor))
        ) return;

        source.allResources.forEach((resources, resourceType) => {
          // Filter all resources by requested resource type
          if (filterOptions.resourceType!=='all') {
            if (resourceType !== filterOptions.resourceType) return;
          }
          // add this source's filtered resources to the result
          if (!resourcesByType.has(resourceType)) resourcesByType.set(resourceType, []);
          resourcesByType.set(
            resourceType,
            resourcesByType.get(resourceType).concat(resources.filter((resource) => resource.filter(filterOptions)))
          )
        })
      })
      return resourcesByType;
    }
  }
  return _CollectedSources;
})();

export {
  CollectedSources,
};
