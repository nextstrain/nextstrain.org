#!/usr/bin/env node
import { ArgumentParser } from 'argparse';

import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminUpdateUserAttributesCommand,
  CreateGroupCommand,
  paginateAdminListGroupsForUser,
} from '@aws-sdk/client-cognito-identity-provider';

import fs from 'fs';
import yaml from 'js-yaml';
import process from 'process';
import { COGNITO_USER_POOL_ID } from '../src/config.js';
import { Group } from '../src/groups.js';
import { reportUnhandledRejectionsAtExit } from '../src/utils/scripts.js';


const REGION = COGNITO_USER_POOL_ID.split("_")[0];

const cognito = new CognitoIdentityProviderClient({ region: REGION });

const STATUS_CREATED = Symbol("created");
const STATUS_UPDATED = Symbol("updated");
const STATUS_EXISTED = Symbol("existed");
const STATUS_REMOVED = Symbol("removed");
const STATUS_SKIPPED = Symbol("skipped");


function parseArgs() {
  const argparser = new ArgumentParser({
    description: `
      Provision AWS Cognito resources for a Nextstrain Group and its members.
      The group must already be defined in the groups.json data file.
    `,
  });

  argparser.addArgument("groupName", {metavar: "<name>", help: "Name of the Nextstrain Group"});
  argparser.addArgument("--members", {
    dest: "membersFile",
    metavar: "<file.yaml>",
    help: `
      A YAML file describing the initial members to add to the Group.  If
      necessary, users will be created and sent invites.  The file must be an
      array of objects (i.e.  dict/map/hash).  Each object must contain a
      "username" and "email" key.  The optional key "role" may be set to
      "viewers", "editors", or "owners"; the default if not provided is
      "viewers".  The optional key "name" provides the user's name (not
      username).  A special key, "mustExist", may be set to true to avoid
      accidentally creating (and thus inviting) a user that should already
      exist.
    `,
  });

  return argparser.parseArgs();
}


function main({groupName, membersFile}) {
  // Canonicalizes name for us and ensures a data entry exists.
  const group = new Group(groupName);

  const members = membersFile
    ? readMembersFile(group, membersFile)
    : null;

  console.log(`Provisioning Nextstrain Group ${group.name}`);

  provision(group, members)
    .then(() => console.log("Provisioning complete!"))
    .catch(error => {
      console.error("\n\n%s\n", error);
      console.error("Provisioning FAILED.  See above for details.  It's typically safe to re-run this program after fixing the issue.");
      process.exitCode = 1;
    });
}


async function provision(group, members) {
  await createRoleGroups([...group.membershipRoles.values()]);

  if (members) {
    await createMembers(
      members.map(({username, email, name, role = "viewers", mustExist = false}) => ({
        group,
        role,
        username,
        email,
        name,
        mustExist,
      }))
    );
  }
}


function readMembersFile(group, file) {
  const members = yaml.load(fs.readFileSync(file));

  const validationErrors = !Array.isArray(members)
    ? ["Not an array"]
    : [
      ...members.filter(m => !(m.username && m.email))
          .map(m => `Username and/or email missing for member ${JSON.stringify(m)}`),

      ...members.filter(m => m.role && !group.membershipRoles.get(m.role))
          .map(m => `Unrecognized role "${m.role}" for user ${m.username}`),
    ];

  if (validationErrors.length) {
    const msg = validationErrors.map((err, i) => ` ${i+1}. ${err}`).join("\n");
    const s = validationErrors.length === 1 ? "" : "s";
    throw new Error(`Members file contains ${validationErrors.length} error${s}:\n${msg}`);
  }

  return members;
}


async function createRoleGroups(roleGroups) {
  console.log("Creating role groups in Cognito…");
  console.group();

  let abort = false;

  const results = new Map(roleGroups.map(g => [g, createCognitoGroup(g)]));

  for (const [roleGroup, status] of results) {
    try {
      console.log(`${roleGroup} ${(await status).description}`);
    } catch (error) {
      console.error(`${roleGroup} errored: ${error}`);
      abort = true;
    }
  }

  console.groupEnd();

  if (abort) throw new Error("Error creating role groups");
}


async function createMembers(members) {
  console.log("Creating members in Cognito…");
  console.group();

  let abort = false;

  const results = new Map(members.map(m => [m, createMember(m)]));

  for (const [member, result] of results) {
    console.log(`${member.username} email=${member.email} name=${member.name || ""}`);
    console.group();

    const {userStatus, membershipStatuses} = await result;

    try {
      console.log(`user ${(await userStatus).description}`);
    } catch (error) {
      console.error("user creation errored:", error);
      abort = true;
    }

    for (const [roleGroup, membershipStatus] of await membershipStatuses) {
      try {
        const status = await membershipStatus;
        if (status !== STATUS_SKIPPED) {
          console.log(`membership in ${roleGroup} ${status.description}`);
        }
      } catch (error) {
        console.error("membership errored:", error);
        abort = true;
      }
    }

    console.groupEnd();
  }

  console.groupEnd();

  if (abort) throw new Error("Error creating members");
}


async function createMember({group, role: memberRole, username, email, name, mustExist}) {
  const doesNotExistButMust = error => {
    switch (error.name) {
      case "UserNotFoundException":
        throw new Error(`username ${username} marked "mustExist" but does not`);

      default:
        throw error;
    }
  };

  const userCreation = mustExist
    ? updateCognitoUser({username, email, name}).catch(doesNotExistButMust)
    : createCognitoUser({username, email, name});

  const userGroups = userCreation.then(status =>
    // save a request if we just created the user
    status === STATUS_CREATED
      ? new Set()
      : cognitoUserGroups(username)
  );

  return {
    // Promise<status: STATUS_CREATED|STATUS_UPDATED|STATUS_EXISTED>
    userStatus: userCreation,

    // Map<roleGroup: string, membershipStatus: Promise<STATUS_CREATED|STATUS_EXISTED|STATUS_SKIPPED>>
    membershipStatuses: new Map(
      Array.from(group.membershipRoles).map(([role, roleGroup]) => [
        roleGroup,
        userGroups.then(existingMemberships =>
          role === memberRole
            ? !existingMemberships.has(roleGroup)
              ? addCognitoUserToGroup(username, roleGroup)
              : STATUS_EXISTED
            : existingMemberships.has(roleGroup)
              ? removeCognitoUserFromGroup(username, roleGroup)
              : STATUS_SKIPPED
        )
      ])
    ),
  };
}


/**
 * Create a group in AWS Cognito.
 *
 * @param {string} name - Name of the AWS Cognito group
 * @returns {STATUS_CREATED|STATUS_EXISTED}
 */
async function createCognitoGroup(name) {
  try {
    await cognito.send(new CreateGroupCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      GroupName: name,
    }));

    return STATUS_CREATED;
  } catch (error) {
    switch (error.name) {
      case "GroupExistsException":
        return STATUS_EXISTED;

      default:
        throw error;
    }
  }
}


/**
 * Create a user in AWS Cognito.
 *
 * If the user already exists, their existing email address must match the
 * email address given or an error will be thrown to avoid mix ups.  The name
 * (not username) of an existing user will be updated if needed.
 *
 * An invite email will be sent to the user upon creation.
 *
 * @param {object} user
 * @param {string} user.username
 * @param {string} user.email
 * @param {string} [user.name]
 * @returns {STATUS_CREATED|STATUS_UPDATED|STATUS_EXISTED}
 */
async function createCognitoUser({username, email, name}) {
  if (!username || !email) throw new Error("username and email are required");

  try {
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: username,
      UserAttributes: [
        {Name: "email", Value: email},
        {Name: "email_verified", Value: "True"},
        ...(name ? [{Name: "name", Value: name}] : []),
      ],
      DesiredDeliveryMediums: ["EMAIL"],
    }));

    return STATUS_CREATED;
  } catch (error) {
    switch (error.name) {
      case "UsernameExistsException":
        return await updateCognitoUser({username, email, name});

      default:
        throw error;
    }
  }
}


/**
 * Update a user in AWS Cognito.
 *
 * The user must already exist with the given username and email.  The name
 * (not username) of the existing user will be updated if needed.
 *
 * @param {object} user
 * @param {string} user.username
 * @param {string} user.email
 * @param {string} [user.name]
 * @returns {STATUS_UPDATED|STATUS_EXISTED}
 */
async function updateCognitoUser({username, email, name}) {
  if (!username || !email) throw new Error("username and email are required");

  const existingUser = await cognitoUser(username);

  /* Confirm existing username has matching email address so we don't
   * accidentally mix up users.
   */
  if (existingUser.email !== email) {
    throw new Error(`username ${username} already exists with email ${existingUser.email}, which doesn't match ${email}`);
  }

  // Update name if necessary
  if (name && existingUser.name !== name) {
    return await updateCognitoUserAttributes(username, {name});
  }
  return STATUS_EXISTED;
}


/**
 * Add an AWS Cognito user to a Cognito group.
 *
 * @param {string} username
 * @param {string} group - Name of the AWS Cognito group
 */
async function addCognitoUserToGroup(username, group) {
  await cognito.send(new AdminAddUserToGroupCommand({
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username,
    GroupName: group,
  }));
  return STATUS_CREATED;
}


/**
 * Remove an AWS Cognito user from a Cognito group.
 *
 * @param {string} username
 * @param {string} group - Name of the AWS Cognito group
 */
async function removeCognitoUserFromGroup(username, group) {
  await cognito.send(new AdminRemoveUserFromGroupCommand({
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username,
    GroupName: group,
  }));
  return STATUS_REMOVED;
}


/**
 * Retrieve information about an AWS Cognito user.
 *
 * @param {string} username
 * @returns {object} User object with a `username` key and keys for each
 *   attribute (e.g. `email`, `name`).
 */
async function cognitoUser(username) {
  const existingUser = await cognito.send(new AdminGetUserCommand({
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username,
  }));

  const attrs = Object.fromEntries(
    existingUser.UserAttributes
      .map(({Name, Value}) => [Name, Value])
  );

  return {
    username: existingUser.Username,
    ...attrs,
  };
}


/**
 * Update attributes of an AWS Cognito user.
 *
 * @param {string} username
 * @param {object.<string, string>} attrs - name/value pairs
 */
async function updateCognitoUserAttributes(username, attrs) {
  await cognito.send(new AdminUpdateUserAttributesCommand({
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username,
    UserAttributes: Object.entries(attrs).map(([k, v]) => ({Name: k, Value: v})),
  }));
  return STATUS_UPDATED;
}


/**
 * Retrieve the names of the AWS Cognito groups of which a user is a member.
 *
 * @param {string} username
 * @returns {Set} set of AWS Cognito group names
 */
async function cognitoUserGroups(username) {
  const groups = new Set();

  const paginator = paginateAdminListGroupsForUser({client: cognito}, {
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username,
  });

  for await (const page of paginator) {
    for (const group of page.Groups) {
      groups.add(group.GroupName);
    }
  }

  return groups;
}


reportUnhandledRejectionsAtExit();
main(parseArgs());
