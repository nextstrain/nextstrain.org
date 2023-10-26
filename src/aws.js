/**
 * AWS bits and bobs.
 *
 * @module aws
 */
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { ProxyAgent } from "proxy-agent";

const agent = new ProxyAgent();

/**
 * Client configuration shared across services.
 *
 * AWS SDK v3 doesn't have the concept of a global config like v2 did, so this
 * is it.
 *
 * HTTP and HTTPS agents are configured to use a proxy agent based on the
 * environment (e.g. http_proxy), if any.
 */
export const clientConfig = {
    requestHandler: new NodeHttpHandler({
        httpAgent: agent,
        httpsAgent: agent,
    }),
};
