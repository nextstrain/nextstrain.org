/**
 * AWS bits and bobs.
 *
 * @module aws
 */
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { ProxyAgent } from "proxy-agent";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

import { AWS_REGION } from "./config.js";

const agent = new ProxyAgent();

/**
 * Client configuration shared across services.
 *
 * AWS SDK v3 doesn't have the concept of a global config like v2 did, so this
 * is it.
 *
 * A region is set to {@link config.AWS_REGION}, which itself comes from the
 * AWS_REGION environment variable or our own config file.  It may be null, in
 * which case the AWS SDK's logic for determining region is used and in
 * practice that means the standard AWS config file.  See
 * {@link https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html}.
 *
 * HTTP and HTTPS agents are configured to use a proxy agent based on the
 * environment (e.g. http_proxy), if any.
 */
export const clientConfig = {
    region: AWS_REGION,
    requestHandler: new NodeHttpHandler({
        httpAgent: agent,
        httpsAgent: agent,
    }),
};

/**
 * Attempt to identify the IAM user name behind the current AWS credentials
 * (useful for debugging / server start-up messages). Some external users of
 * the nextstrain server may be using non-AWS services, but these may still be
 * compatible with STS so we make a best-effort attempt here.
 */
export async function getAwsId() {
  const client = new STSClient(clientConfig);
  const command = new GetCallerIdentityCommand({});
  try {
    const data = await client.send(command);
    if (data.Arn.startsWith('arn:aws:iam::')) {
      return (`IAM user '${data.Arn.replace(/^.+user\//, '')}'`)
    }
    return data.Arn; // report the ARN for non-IAM credentials
  } catch (error) {
    return `ERROR: ${error}`
  }
}