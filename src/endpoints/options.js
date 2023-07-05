import * as authz from "../authz/index.js";


/**
 * Generate an Express endpoint that responds to an OPTIONS request with an
 * Allow header based on the current user's authorized actions on an object
 * determined by the request.
 *
 * The Allow header will include the OPTIONS, GET, and HEAD methods if the
 * current user is granted {@link module:../authz/actions.Read} and PUT and
 * DELETE if {@link module:../authz/actions.Write}.
 *
 * @param {authzObjectExtractor} authzObjectExtractor - Function to provide the object of authorization checks from the request
 * @returns {expressEndpoint}
 * @throws {module:../exceptions.AuthzDenied} if {@link module:../authz/actions.Read} is not authorized
 */
export const forAuthzObject = (authzObjectExtractor) => (req, res) => {
  const authzObject = authzObjectExtractor(req);

  authz.assertAuthorized(req.user, authz.actions.Read, authzObject);

  const allowedMethods = ["OPTIONS", "GET", "HEAD"];

  if (authz.authorized(req.user, authz.actions.Write, authzObject)) {
    allowedMethods.push("PUT", "DELETE");
  }

  res.set("Allow", allowedMethods);
  return res.status(204).end();
};


/**
 * @callback authzObjectExtractor
 * @param {express.request} req
 * @returns {object} An object supported by the authz system.
 */
