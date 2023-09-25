import { CollectedSources } from '../../sources/index.js';
import { splitPrefixIntoParts } from '../../utils/prefix.js';
import { BadRequest } from '../../httpErrors.js';

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

  const filterOptions = parseFilterOptions(req);
  const availableResources = (new CollectedSources(req.user))
    .resources(filterOptions)

  const available = Object.fromEntries(
    Array.from(availableResources)
      .map(([resourceType, resources]) =>
        [resourceType, resources.map((resource) => {
          const data = {
            name: resource.name,
            url: resource.nextstrainUrl(),
            lastUpdated: resource.lastUpdated(),
          }
          if (filterOptions.showVersions) {
            data.versions = resource.versions.map((v) =>
              [resource.lastUpdated(v), resource.nextstrainUrl(v)])
          }
          return data;
        })])
  )

  const WARNING = "This API is currently for internal use only. The request and response schemas will change."
  res.json({WARNING, ...available});
}

export {
  getAvailableV2,
};


const ALLOWED_TYPES = ['all', 'dataset', 'narrative', 'file'];

function parseFilterOptions(req) {
  /** Currently we only consider a few filtering options, see the comment in `CollectedSources()`
   * for more details on the eventual aims here.
   * The current (WIP!) design encodes prefix as a query param, but if we decide that most requests
   * will only specify this option (e.g. sensible defaults are chosen / inferred for other options)
   * then it's perhaps more natural to encode this in the API path itself
   */
  const {source, prefixParts, isNarrative} = req.query?.prefix?.toString() ?
    splitPrefixIntoParts(req.query.prefix) :
    {source: false, prefixParts: [], isNarrative: undefined};

  /* A single empty string is valid, but isn't desirable for filtering purposes */
  if (prefixParts.length===1 && prefixParts[0]==='') prefixParts.pop();

  const showVersions = req.query?.versions!==undefined; // test for presence of query parameter

  let resourceType = req.query?.type || 'all';
  if (!ALLOWED_TYPES.includes(resourceType)) {
    throw new BadRequest("Specified resource type is not allowed");
  }
  if (resourceType==='all' && isNarrative) {
    resourceType='narrative';
  }
  if (isNarrative && resourceType!=='narrative') {
    throw new BadRequest("Contradiction in requested resource types between prefix + specified type")
  }

  return {
    source,
    showVersions,
    prefixParts,
    resourceType
  }
}

