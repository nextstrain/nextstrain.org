#!/usr/bin/env node
import { ArgumentParser } from 'argparse';

import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import process from 'process';
import yaml from 'js-yaml';
import { COGNITO_USER_POOL_ID } from '../src/config.js';
import { reportUnhandledRejectionsAtExit } from '../src/utils/scripts.js';

const REGION = COGNITO_USER_POOL_ID.split('_')[0];

const cognito = new CognitoIdentityProviderClient({ region: REGION });

function parseArgs() {
  const argparser = new ArgumentParser({
    description: `
      Export members of a Nextstrain Group to YAML format.
    `,
  });

  argparser.addArgument("groupName", {metavar: "<name>", help: "Name of the Nextstrain Group"});

  return argparser.parseArgs();
}

function formatYamlEntry(username, email, name, role) {
  return yaml.dump([{ username, email, ...(name ? { name } : {}), role }]);
}

async function listUsersInGroup(groupName) {
  const users = [];
  let nextToken = undefined;

  do {
    try {
      const response = await cognito.send(
        new ListUsersInGroupCommand({
          UserPoolId: COGNITO_USER_POOL_ID,
          GroupName: groupName,
          NextToken: nextToken,
        })
      );

      if (response.Users) {
        users.push(...response.Users);
      }

      nextToken = response.NextToken;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        return [];
      }
      throw error;
    }
  } while (nextToken);

  return users;
}

async function main({ groupName }) {
  const entries = [];

  for (const role of ['owners', 'editors', 'viewers']) {
    const cognitoGroupName = `${groupName}/${role}`;
    const users = await listUsersInGroup(cognitoGroupName);

    for (const user of users) {
      const username = user.Username;
      const email = user.Attributes?.find((attr) => attr.Name === 'email')?.Value;
      const name = user.Attributes?.find((attr) => attr.Name === 'name')?.Value;

      entries.push(formatYamlEntry(username, email, name, role));
    }
  }

  if (entries.length > 0) {
    process.stdout.write(entries.join('\n'));
  }
}

reportUnhandledRejectionsAtExit();
main(parseArgs());
