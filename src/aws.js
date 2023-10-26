/**
 * AWS bits and bobs.
 *
 * @module aws
 */
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { ProxyAgent } from "proxy-agent";

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
