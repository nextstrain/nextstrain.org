import { CollectedSources } from '../../sources/index.js';

/**
 * Handler for /charon/getAvailable/V2 requests
 * 
 * WIP: The getAvailable API design should be flexible enough to access
 * resources across the nextstrain ecosystem. This is a more flexible
 * definition of resource than our Resource class as this may include
 * intermediate files (sequences, alignments, metadata) which are not
 * fetched by Auspice. 
 * 
 * The entire set of these resources is large, and this API hasn't been
 * tested for performance. Currently the set is held in memory and
 * filtering operations are performed for each request.
 * 
 * Note: we can set properties in layers of middleware, or in this handler
 * since all of these properties are _only_ used by this handler
 * it makes sense to place them here. If they become more widespread
 * then it's easy to lift them to middleware and expose the data on context.
 * 
 * The response is always JSON, which our frontend(s) will parse and display.
 * The Accept header is not considered, however we could expand this to use
 * `contentTypesProvided` and `contentTypesConsumed` to behave return different
 * formats accordingly.
 *
 */
const getAvailableV2 = async (req, res) => {

  const availableResources = (new CollectedSources(req.user))
    .resources() // TODO -- parameterise with filters

  // console.log("availableResources", availableResources)

  const available = Object.fromEntries(
    Array.from(availableResources)
      .map(([resourceType, resources]) =>
        [resourceType, resources.map((resource) => {
          return {
            name: resource.name,
            url: resource.nextstrainUrl(),
            lastUpdated: resource.lastUpdated(),
            versions: resource.versions.map((v) =>
              [resource.lastUpdated(v), resource.nextstrainUrl(v)]
            )
          }
        })])
  )

  const WARNING = "This API is currently for internal use only. The request and response schemas will change."
  res.json({WARNING, available});
}

export {
  getAvailableV2,
};

