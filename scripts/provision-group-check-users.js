#!/usr/bin/env node
import { ArgumentParser } from 'argparse';
import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    AdminListGroupsForUserCommand
  } from '@aws-sdk/client-cognito-identity-provider';
import fs from 'fs';
import yaml from 'js-yaml';
import process from 'process';
import { Group } from '../src/groups.js';
import { reportUnhandledRejectionsAtExit } from '../src/utils/scripts.js';
/**
 * COGNITO_USER_POOL_ID will read from the eponymous env variable or look in a
 * config file. The config file is set via the env variable `CONFIG_FILE`, or
 * either env/production/config.json or env/testing/config.json depending on
 * your environment (NODE_ENV) */
import { COGNITO_USER_POOL_ID, PRODUCTION } from '../src/config.js';

const DESCRIPTION = `
  A helper script to check provided emails against existing cognito users
  in the pool. The CLI interface is the same as 'provision-group' however
  no changes will be made (to cognito) by this script.

  We attempt to check various scenarios (email matches, username matches) and print
  verbose output so that we can update existing users where possible.

  P.S. Set 'CONFIG_FILE=env/production/config.json' to use the production cognito
  user pool; by default we'll use the pool defined in 'env/testing/config.json'
  or the env variable 'COGNITO_USER_POOL_ID' if set.
`;

const REGION = COGNITO_USER_POOL_ID.split("_")[0];
const cognito = new CognitoIdentityProviderClient({ region: REGION });

function parseArgs() {
    const argparser = new ArgumentParser({description: DESCRIPTION});
    argparser.addArgument("groupName", {metavar: "<name>", help: "Name of the Nextstrain Group"});
    argparser.addArgument("--members", {
      dest: "membersFile",
      metavar: "<file.yaml>",
      required: true,
      help: `
        A YAML file describing the members to add to the Group.
        The file must be an array of objects (i.e.  dict/map/hash).
        Each object must contain an "email" key which is case-sensitive.
        The "username" key is optional for this script, but is required when you actually create provision the group membership.
        The "role" key is optional and may be set to "viewers", "editors", or "owners"; the default if not provided is "viewers".
      `
    });
    return argparser.parseArgs();
  }


async function main({groupName, membersFile}) {
  // Canonicalizes name for us and ensures a data entry exists.
  const group = new Group(groupName);
  console.log(`[debug] Node environment: ${PRODUCTION ? 'production' : 'testing'}`)
  const members = readMembersFile(membersFile)
  const {usersByEmail, usersByUsername} = await cognitoUsers()

  for (const member of members) {
    if (!member.username) {
      await candidateUsernamesForEmail(group, member, usersByEmail);
    } else {
      await crossReferenceUsernameAndEmail(group, member, usersByEmail, usersByUsername);
    }
  }
}


function readMembersFile(file) {
  const members = yaml.load(fs.readFileSync(file));

  const validationErrors = !Array.isArray(members)
    ? ["Not an array"]
    : members.filter(m => !m.email)
      .map(m => `Email missing for member ${JSON.stringify(m)}`)
    ;

  if (validationErrors.length) {
    const msg = validationErrors.map((err, i) => ` ${i+1}. ${err}`).join("\n");
    const s = validationErrors.length === 1 ? "" : "s";
    throw new Error(`Members file contains ${validationErrors.length} error${s}:\n${msg}`);
  }

  return members;
}

function getEmailFromUser(user) {
  return user.Attributes.filter(({Name}) => Name==='email')[0].Value;
}

/**
 * Returns all the users in the pool. NOTE: we could make a cheaper request and query by email,
 * but in order to perform case-insensitive email matching we gather them all here.
 * The returned objects (usersByEmail, usersByUsername) associate the case-sensitive email/username
 * with a list of user objects. The most salient properties of the user object is `Username`
 */
async function cognitoUsers() {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ListUsersCommand/
  console.log(`[debug] Fetching existing membership data for cognito user pool "${COGNITO_USER_POOL_ID}"`)
  const params = {
    AttributesToGet: ['email'], // all users must have this else cmd fails
    UserPoolId: COGNITO_USER_POOL_ID,
    // Limit: 60, // default: 60
  }
  let Users, PaginationToken;
  try {
    ({Users, PaginationToken} = await cognito.send(new ListUsersCommand(params)));
    while (PaginationToken) {
      const data = await cognito.send(new ListUsersCommand({...params, PaginationToken}));
      Users = [...Users, ...data.Users]
      PaginationToken = data.PaginationToken
    }
  } catch (e) {
    // Importing the actual error is difficult due to @aws-sdk/property-provider (where the error is defined)
    // being a nested dependency of `@aws-sdk/credential-provider-node`.
    if (e.name === 'CredentialsProviderError') {
      console.error(`FATAL ERROR: ${e.message}`)
      process.exit(2);
    }
    throw e;
  }
  // there may be duplicate emails (different users)
  const [usersByEmail, usersByUsername] = [{}, {}]
  for (const user of Users) {
    const email = getEmailFromUser(user);
    Object.hasOwn(usersByEmail, email) ? usersByEmail[email].push(user) : (usersByEmail[email]=[user])
    usersByUsername[user.Username] = user; // Username is unique (within a user pool)
  }

  return {usersByEmail, usersByUsername};
}

/**
 * For a given nextstrain group and username, return the role this username
 * already has for the (nextstrain) group. Note that our RBAC design says that a
 * user should have zero roles (i.e. play no role in this group) or one role,
 * but no more than one; our implementation (cognito groups attached to a user)
 * allows for multiple roles; in such a situation we return the string
 * "INVALID_MULTIPLE_ROLES".
 */
async function getUserRole(group, username) {
  // roles are based upon group membership, which must be queried per-username
  const params = {
    Username: username,
    UserPoolId: COGNITO_USER_POOL_ID,
  }
  let cognitoGroups = [];
  try {
    const res = await cognito.send(new AdminListGroupsForUserCommand(params));
    cognitoGroups = res.Groups.map((g) => g.GroupName);
    if (!Array.isArray(cognitoGroups)) {
      throw new Error(`unexpected type for "Groups" data from the AdminListGroupsForUserCommand request for user ${username}`)
    }
  } catch (e) {
    console.error(`FATAL ERROR while fetching (cognito) groups for user ${username}`)
    console.error(e)
    process.exit(2)
  }

  // for the specified nextstrain group, which cognito groups are relevant?
  // (each cognito group corresponds to a role)
  const rolesByCognitoGroup = new Map(
    Array.from(group.membershipRoles.entries())
      .map(([role, groupName]) => [groupName, role])
  );

  const existingRoles = cognitoGroups
    .map((g) => rolesByCognitoGroup.has(g) ? rolesByCognitoGroup.get(g) : false)
    .filter(Boolean);

  if (existingRoles.length===0) return false;
  if (existingRoles.length>1) return "INVALID_MULTIPLE_ROLES";
  return existingRoles[0];
}


/**
 * Given a proposed username/email pairing, cross-reference against the existing
 * cognito pool. We primarily search by username, as that's the index of the pool.
 *
 */
async function crossReferenceUsernameAndEmail(group, member, usersByEmail, usersByUsername) {
  console.log()
  console.log(`Membership request for user "${member.username}" (${member.email}). Proposed role: ${member.role}`)
  const emailMatch = searchCognito(usersByEmail, member.email);
  const userNameMatch = member.username && searchCognito(usersByUsername, member.username);

  // Situation 1: Username match (either exact or with different casing)
  if (userNameMatch && userNameMatch.candidates.length===1) {
    const cognitoUsername = userNameMatch.candidates[0];
    userNameMatch.exact ?
      console.log(`\tOne exact username match found`) :
      console.log(`\tOne username match found but the case differs: "${cognitoUsername}"\n\tACTION: change the username casing`);

    const role = await getUserRole(group, cognitoUsername);
    role ?
      console.log(`\tUser currently has role ${role}`) :
      console.log(`\tNo role currently associated with the user for this group`);

    const associatedEmail = getEmailFromUser(usersByUsername[cognitoUsername]);
    if (associatedEmail===member.email) {
      console.log(`\tThe email exactly matches the one associated with the existing user`)
    } else if (associatedEmail.toUpperCase()===member.email.toUpperCase()) {
      console.log(`\tThe cognito email matches but with different case: "${associatedEmail}"`)
      console.log(`\tACTION: change the casing of the email to match`)
    } else {
      console.log(`\tYour email wasn't the one associated with the cognito user`)
      console.log(`\tACTION: change email to "${associatedEmail}"`)
      if (emailMatch) {
        const users = emailMatch.candidates.flatMap((e) => usersByEmail[e].map((u) => u.Username));
        console.log(`\t(NOTE: your provided email, "${member.email}", was associated with other user(s): ${users.join(", ")}, so you may want to use a different username instead)`)
      }
    }
    return;
  }

  // Situation 2: Multiple usernames.
  if (userNameMatch && userNameMatch.candidates.length>1) {
    console.log(`\tThere are multiple matching usernames which differ by case:`)
    for (const cognitoUsername of userNameMatch.candidates) {
      const exactMsg = cognitoUsername===member.username ? '(exact match)' : '(case differs)';
      const associatedEmail = getEmailFromUser(usersByUsername[cognitoUsername]);
      const emailMsg = cognitoUsername===member.email ?
        '(exact match)' :
        cognitoUsername.toUpperCase()===member.email.toUpperCase() ? 
          '(case differs)' :
          '(not a match with the provided email)';
      const role = await getUserRole(group, cognitoUsername);
      const roleMsg = role ? `Current role: ${role}` : `Currently has no role for this group`;

      console.log(`\t\t${cognitoUsername} ${exactMsg}. Associated email: ${associatedEmail} ${emailMsg}. ${roleMsg}.`);
    }
    console.log(`\tACTION: Ensure you are using the correct username / email from the above choices`)
    console.log(`\tACTION: Multiple usernames which differ by case indicates a wider problem with the pool; consider fixing this`)
    return;
  }

  // Situation 3: No matching usernames but email matches
  if (emailMatch) {
    console.log(`\tNo matching usernames in the pool (case insensitive) but the email did match.`)
    describeMatchingEmails(group, member, emailMatch, usersByEmail);
    return;
  }

  // Situation 4: No matching usernames AND no matching email
  console.log(`\tNo matches to username or email in the existing pool, so a new user will be added!`)
}

/** If a member (via the provided YAML) doesn't have a username then we cross
 * reference emails against the pool and suggest potential usernames.
 *
 */
async function candidateUsernamesForEmail(group, member, usersByEmail) {
  console.log()
  console.log(`Request for user with email "${member.email}" but unknown username. Proposed role: ${member.role}`)
  const emailMatch = searchCognito(usersByEmail, member.email);

  if (!emailMatch) {
    console.log(`\tThe proposed email is not present in this cognito pool (via case-insensitive matching)`)
    console.log(`\tACTION: Choose a username and add it to the YAML (and potentially run this script again if you want to check for username collisions)`)
    return;
  }

  describeMatchingEmails(group, member, emailMatch, usersByEmail);
}

async function describeMatchingEmails(group, member, emailMatch, usersByEmail) {
  if (emailMatch.candidates.length===1) {
    emailMatch.exact ?
      console.log(`\tThere is one email which matches exactly. Associated users:`) :
      console.log(`\tThere is one matching email, "${emailMatch.candidates[0]}", but it doesn't have the same casing. Associated users:`);
    for (const user of usersByEmail[emailMatch.candidates[0]]) {
      const role = await getUserRole(group, user.Username);
      console.log(`\t\t${user.Username} ${role ? `(existing group role: ${role})` : '(no existing role in group)'}`);
    }
    console.log(`\tACTION: Use a username from above and cross-reference with existing roles.`)
    if (!emailMatch.exact) {
      console.log(`\tACTION: Correct the case of the provided email.`)
    }
  } else {
    console.log(`\tThere are multiple matching emails which differ by case:`)
    for (const email of emailMatch.candidates) {
      console.log(`\t\t${email}${email===member.email ? ' (exact match)' : ''}. Associated user(s):`)
      for (const user of usersByEmail[email]) {
        const role = await getUserRole(group, user.Username);
        console.log(`\t\t\t${user.Username} ${role ? `(existing group role: ${role})` : '(no existing role in group)'}`);
      }
    }
    console.log(`\t(Ideally we would update the pool so there's only one unique email in use)`)
    console.log(`\tACTION: Use a username (& email) from above and cross-reference with existing roles.`)
  }
}

/**
 * Search the user data by a query string in a case-insensitive manner.
 * The user data is an object with keys being either usernames or emails
 * (case sensitive); the query should be a username or email, respectively.
 * We return false if there is no (case-insensitive) match, or an object
 * with keys `candidates` (an array of case-insensitive matching keys
 * of the provided user data) and `exact` (whether one of these keys is an
 * exact case-sensitive match)
 */
function searchCognito(usersByUsernameOrEmail, query) {
  const candidates = [];
  for (const cognitoValue of Object.keys(usersByUsernameOrEmail)) {
    if (cognitoValue.toUpperCase() === query.toUpperCase()) {
      candidates.push(cognitoValue);
    }
  }
  const exact = candidates.includes(query);
  if (candidates.length===0) return false;
  return {candidates, exact};
}


reportUnhandledRejectionsAtExit();
main(parseArgs())
  .catch((error) => {
    process.exitCode = 1;
    console.error(error)
  });
