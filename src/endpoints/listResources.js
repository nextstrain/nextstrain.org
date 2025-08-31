import {ListResources} from "../resourceIndex.js";
import * as utils from '../utils/index.js';
import { contentTypesProvided } from '../negotiate.js';
import { BadRequest } from '../httpErrors.js';

/**
 * An express route handler to send data (or throw an error) for the requested
 * resources
 * 
 * @type {asyncExpressHandler}
 */
const listResourcesJson = async (req, res) => {
  /* API currently only handles a limited range of sources / resource types.
  ListResources will throw a HTTP error if they do not exist */
  const resourceType = req.params.resourceType;
  const sourceName = req.params.sourceName;
  const unexpectedUriParts = req.params[0];
  const query = req.query;
  if (!resourceType || !sourceName || unexpectedUriParts) {
    throw new BadRequest(`Malformed listing resources URI`)
  }
  const resources = new ListResources([sourceName], [resourceType], query);
  const data = {
    WARNING: `This API is intended for internal use only. The API, including the address, may change at any point without notice.`,
    ...resources.data
  }
  utils.verbose(`[LIST RESOURCES] Sending JSON for source "${sourceName}" resource type "${resourceType}"`);
  return res.json(data);
};

export const listResources = contentTypesProvided([
  ["text/html", (req, res, next) => next()], /* go to to next acceptable routing middleware (currently Gatsby) */
  ["application/json", listResourcesJson],
])