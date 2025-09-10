#!/usr/bin/env node
import { ArgumentParser } from 'argparse';
import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
  } from '@aws-sdk/client-cognito-identity-provider';
import fs from 'fs';
import yaml from 'js-yaml';
import process from 'process';
import { COGNITO_USER_POOL_ID } from '../src/config.js';
import { reportUnhandledRejectionsAtExit } from '../src/utils/scripts.js';

const REGION = COGNITO_USER_POOL_ID.split("_")[0];
const cognito = new CognitoIdentityProviderClient({ region: REGION });

function parseArgs() {
    const argparser = new ArgumentParser({
      description: `
        A helper script to check provided emails against existing cognito users.
        If a username is provided that is also checked against existing users.
        Messages are printed to STDOUT.
        Set 'CONFIG_FILE=env/production/config.json' to use the production cognito
        user pool (default: pool defined in env/testing/config.json)
      `,
    });  
    argparser.addArgument("--members", {
      dest: "membersFile",
      metavar: "<file.yaml>",
      required: true,
      help: `
        A YAML file intended for 'provision-group.js'. Each entry must contain a 'email'
        key and optionally a 'username' key.
      `,
    });
  
    return argparser.parseArgs();
  }


async function main({membersFile}) {
  const members = readMembersFile(membersFile)
  const {usersByEmail, usersByUsername} = await cognitoUsers()
  queryUsernames(members, usersByEmail, usersByUsername)
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

async function cognitoUsers() {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ListUsersCommand/
  const params = {
    AttributesToGet: ['email'], // all users must have this else cmd fails
    UserPoolId: COGNITO_USER_POOL_ID,
    // Limit: 60, // default: 60
  }
  let {Users, PaginationToken} = await cognito.send(new ListUsersCommand(params));
  while (PaginationToken) {
    const data = await cognito.send(new ListUsersCommand({...params, PaginationToken}));
    Users = [...Users, ...data.Users]
    PaginationToken = data.PaginationToken
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


function queryUsernames(members, usersByEmail, usersByUsername) {
  for (const member of members) {
    if (Object.hasOwn(usersByEmail, member.email)) {
      const existingMsg = `Email ${member.email} exists with username(s) ${usersByEmail[member.email].map((u) => `'${u.Username}'`).join(', ')}`
      if (member.username) {
        const usernameAssociatedWithEmail = usersByEmail[member.email].filter((u) => u.Username===member.username).length>0
        if (usernameAssociatedWithEmail) {
          console.log(`${existingMsg} ALL GOOD.`)
        } else if (Object.hasOwn(usersByUsername, member.username)) {
          console.log(`${existingMsg} but the username '${member.username}' is already associated with '${getEmailFromUser(usersByUsername[member.username])}'`)
        } else {
          console.log(`${existingMsg} and you are asking for the new username '${member.username}' to be created. ALL GOOD.`)
        }
      } else {
        console.log(existingMsg)
      }
    } else {  // new email (not associated with any cognito user)
      const existingMsg = `Email ${member.email} doesn't yet exist`
      if (member.username) {
        if (Object.hasOwn(usersByUsername, member.username)) {
          console.log(`${existingMsg} but the username '${member.username}' is already associated with '${getEmailFromUser(usersByUsername[member.username])}'`)
        } else {
          console.log(`${existingMsg} and neither does the username '${member.username}. ALL GOOD.'`)
        }
      } else {
        console.log(`${existingMsg} (and you haven't specified a username)`)
      }
    }
  }
}

reportUnhandledRejectionsAtExit();
main(parseArgs())
  .catch((error) => {
    process.exitCode = 1;
    console.error(error)
  });
