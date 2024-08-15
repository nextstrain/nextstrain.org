import * as authz from "../authz/index.js";
import { NotFound } from "../httpErrors.js";
import { Group } from "../groups.js";
import {contentTypesProvided, contentTypesConsumed} from "../negotiate.js";
import {deleteByUrls, proxyFromUpstream, proxyToUpstream} from "../upstream.js";
import { slurp } from "../utils/iterators.js";
import * as options from "./options.js";
import * as nextJsApp from "./nextjs.js";


const setGroup = (nameExtractor) => (req, res, next) => {
  const group = new Group(nameExtractor(req));

  authz.assertAuthorized(req.user, authz.actions.Read, group);

  req.context.group = group;
  return next();
};


/* Group customizations
 */

const optionsGroup = options.forAuthzObject(req => req.context.group);


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


/* Members and roles
 */
const listMembers = contentTypesProvided([
  ["html", nextJsApp.handleRequest],
  ["json", async (req, res) => {
    const group = req.context.group;
    authz.assertAuthorized(req.user, authz.actions.Read, group);

    return res.json(await group.members());
    }
  ],
]);


const listRoles = (req, res) => {
  const group = req.context.group;

  authz.assertAuthorized(req.user, authz.actions.Read, group);

  const roles = [...group.membershipRoles.keys()];
  return res.json(roles.map(name => ({name})));
};


const listRoleMembers = async (req, res) => {
  const group = req.context.group;
  const {roleName} = req.params;

  authz.assertAuthorized(req.user, authz.actions.Read, group);

  return res.json(await slurp(group.membersWithRole(roleName)));
};


const getRoleMember = async (req, res) => {
  const group = req.context.group;
  const {roleName, username} = req.params;

  authz.assertAuthorized(req.user, authz.actions.Read, group);

  for await (const member of group.membersWithRole(roleName)) {
    if (member.username === username) {
      return res.status(204).end();
    }
  }

  throw new NotFound(`user ${username} does not have role ${roleName} in group ${group.name}`);
};


const putRoleMember = async (req, res) => {
  const group = req.context.group;
  const {roleName, username} = req.params;

  authz.assertAuthorized(req.user, authz.actions.Write, group);

  await group.grantRole(roleName, username);

  return res.status(204).end();
};


const deleteRoleMember = async (req, res) => {
  const group = req.context.group;
  const {roleName, username} = req.params;

  authz.assertAuthorized(req.user, authz.actions.Write, group);

  await group.revokeRole(roleName, username);

  return res.status(204).end();
};


export {
  setGroup,
  optionsGroup,

  getGroupLogo,
  putGroupLogo,
  deleteGroupLogo,

  getGroupOverview,
  putGroupOverview,
  deleteGroupOverview,

  listMembers,
  listRoles,
  listRoleMembers,

  getRoleMember,
  putRoleMember,
  deleteRoleMember,
};
