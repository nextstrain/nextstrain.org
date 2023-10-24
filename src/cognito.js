/**
 * Cognito user pool (IdP) management.
 *
 * @module cognito
 */
/* eslint-disable no-await-in-loop */
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  paginateListUsersInGroup,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";

import * as aws from "./aws.js";
import { COGNITO_USER_POOL_ID } from "./config.js";
import { NotFound, ServiceUnavailable } from "./httpErrors.js";


const REGION = COGNITO_USER_POOL_ID?.split("_")[0];

const cognito = new CognitoIdentityProviderClient({ ...aws.clientConfig, region: REGION });


function checkServiceAvailable() {
  if (!COGNITO_USER_POOL_ID) {
    throw new ServiceUnavailable(`Server not configured with support for Nextstrain Groups membership management (no COGNITO_USER_POOL_ID).`);
  }
}


/**
 * Retrieve AWS Cognito users in a Cognito group.
 *
 * @param {string} name - Name of the AWS Cognito group
 * @yields {object} user, see <https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/interfaces/usertype.html>
 */
export async function* listUsersInGroup(name) {
  checkServiceAvailable();

  const paginator = paginateListUsersInGroup({client: cognito}, {
    UserPoolId: COGNITO_USER_POOL_ID,
    GroupName: name,
  });

  for await (const page of paginator) {
    yield* page.Users;
  }
}


/**
 * Add an AWS Cognito user to a Cognito group.
 *
 * @param {string} username
 * @param {string} group - Name of the AWS Cognito group
 * @throws {NotFound} if username is unknown
 */
export async function addUserToGroup(username, group) {
  checkServiceAvailable();

  try {
    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: username,
      GroupName: group,
    }));
  } catch (err) {
    if (err instanceof UserNotFoundException) {
      throw new NotFound(`unknown user: ${username}`);
    }
    throw err;
  }
}


/**
 * Remove an AWS Cognito user from a Cognito group.
 *
 * @param {string} username
 * @param {string} group - Name of the AWS Cognito group
 * @throws {NotFound} if username is unknown
 */
export async function removeUserFromGroup(username, group) {
  checkServiceAvailable();

  try {
    await cognito.send(new AdminRemoveUserFromGroupCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: username,
      GroupName: group,
    }));
  } catch (err) {
    if (err instanceof UserNotFoundException) {
      throw new NotFound(`unknown user: ${username}`);
    }
    throw err;
  }
}
