import * as authz from "../authz/index.js";
import { Group } from "../groups.js";
import {contentTypesProvided, contentTypesConsumed} from "../negotiate.js";
import {deleteByUrls, proxyFromUpstream, proxyToUpstream} from "../upstream.js";


const setGroup = (nameExtractor) => (req, res, next) => {
  const group = new Group(nameExtractor(req));

  authz.assertAuthorized(req.user, authz.actions.Read, group);

  req.context.group = group;
  return next();
};


/* Group customizations
 */

const optionsGroupSettings = (req, res) => {
  authz.assertAuthorized(req.user, authz.actions.Read, req.context.group);

  const allowedMethods = ["OPTIONS", "GET", "HEAD"];

  if (authz.authorized(req.user, authz.actions.Write, req.context.group)) {
    allowedMethods.push("PUT", "DELETE");
  }

  res.set("Allow", allowedMethods);
  return res.status(204).end();
};

/* Group logo
 */


/* GET
 */
const getGroupLogo = contentTypesProvided([
  ["image/png", sendGroupLogo],
]);


/* PUT
 */
const putGroupLogo = contentTypesConsumed([
  ["image/png", receiveGroupLogo],
]);


/* DELETE
 */
const deleteGroupLogo = async (req, res) => {
  authz.assertAuthorized(req.user, authz.actions.Write, req.context.group);

  const method = "DELETE";
  const url = await req.context.group.source.urlFor("group-logo.png", method);
  await deleteByUrls([url]);

  return res.status(204).end();
};


/* Group overview
 */


/* GET
 */
const getGroupOverview = contentTypesProvided([
  ["text/markdown", sendGroupOverview],
  ["text/plain", sendGroupOverview],
]);


/* PUT
 */
const putGroupOverview = contentTypesConsumed([
  ["text/markdown", receiveGroupOverview],
]);


/* DELETE
 */
const deleteGroupOverview = async (req, res) => {
  authz.assertAuthorized(req.user, authz.actions.Write, req.context.group);

  const method = "DELETE";
  const url = await req.context.group.source.urlFor("group-overview.md", method);
  await deleteByUrls([url]);

  return res.status(204).end();
};


/**
 * An Express endpoint that sends a group overview determined by the request.
 *
 * @param {express.request} req - Express-style request instance
 * @param {express.response} res - Express-style response instance
 * @returns {expressEndpointAsync}
 */
async function sendGroupOverview(req, res) {
  authz.assertAuthorized(req.user, authz.actions.Read, req.context.group);

  return await proxyFromUpstream(req, res,
    await req.context.group.source.urlFor("group-overview.md"),
    "text/markdown"
  );
}


/**
 * An Express endpoint that receives a group overview determined by the request.
 *
 * @param {express.request} req - Express-style request instance
 * @param {express.response} res - Express-style response instance
 * @returns {expressEndpointAsync}
 */
async function receiveGroupOverview(req, res) {
  authz.assertAuthorized(req.user, authz.actions.Write, req.context.group);

  return await proxyToUpstream(req, res,
    async (method, headers) => await req.context.group.source.urlFor("group-overview.md", method, headers),
    "text/markdown"
  );
}


/**
 * An Express endpoint that sends a group logo determined by the request.
 *
 * @param {express.request} req - Express-style request instance
 * @param {express.response} res - Express-style response instance
 * @returns {expressEndpointAsync}
 */
async function sendGroupLogo(req, res) {
  authz.assertAuthorized(req.user, authz.actions.Read, req.context.group);

  return await proxyFromUpstream(req, res,
    await req.context.group.source.urlFor("group-logo.png"),
    "image/png"
  );
}


/**
 * An Express endpoint that receives a group logo determined by the request.
 *
 * @param {express.request} req - Express-style request instance
 * @param {express.response} res - Express-style response instance
 * @returns {expressEndpointAsync}
 */
async function receiveGroupLogo(req, res) {
  authz.assertAuthorized(req.user, authz.actions.Write, req.context.group);

  return await proxyToUpstream(req, res,
    async (method, headers) => await req.context.group.source.urlFor("group-logo.png", method, headers),
    "image/png"
  );
}


export {
  setGroup,
  optionsGroupSettings,
  getGroupLogo,
  putGroupLogo,
  deleteGroupLogo,
  getGroupOverview,
  putGroupOverview,
  deleteGroupOverview,
};
