/**
 * Redis is used for storing user sessions (see ./authn/index.js) and user
 * staleness timestamps (see ./user.js).
 *
 * The production Redis instance is configured for both volatile (expiring) and
 * non-volatile data using the "volatile-ttl" eviction policy.  User sessions
 * are volatile (but often long-lived) and have a rolling expiration identical
 * to the session cookie's.  Staleness timestamps are volatile with a short
 * TTL.
 *
 * If you're storing more data in Redis, note that keys will default to
 * non-volatile unless an expiration is set.
 *
 * @module redis
 * @see module:authn
 * @see module:user
 * @see https://redis.io/docs/manual/eviction/
 */

import Redis from 'ioredis';

import { PRODUCTION, REVIEW_APP } from './config.js';
import * as utils from './utils/index.js';


/**
 * Global Redis client/connection shared by the app.
 *
 * Connection is made at app start if `REDIS_URL` is defined in the
 * environment, such as in our Heroku deployments.  Otherwise remains null.
 */
const REDIS = process.env.REDIS_URL
  ? herokuRedisClient(process.env.REDIS_URL)
  : null;

/* XXX TODO: Provision lowest-tier Heroku Redis addon for review apps and
 * remove the !REVIEW_APP condition.
 *
 * Heroku has good support for this, but to enable it I think we need to switch
 * how we configure review apps.  Currently they're configured via the Heroku
 * Dashboard¹.  I think we need to switch to the app.json file² instead, as
 * described in the review app documentation.³
 *   -trs, 12 Oct 2023
 *
 * ¹ <https://dashboard.heroku.com/pipelines/38f67fc7-d93c-40c6-a182-501da2f89d9d/settings>
 * ² <https://devcenter.heroku.com/articles/app-json-schema>
 * ³ <https://devcenter.heroku.com/articles/github-integration-review-apps>
 */
if (PRODUCTION && !REVIEW_APP && !REDIS) {
  throw new Error("REDIS_URL required in production mode");
}

if (REDIS) {
  /* Use "info memory" command instead of "config get maxmemory-policy" since
   * Heroku Redis disables admin commands, which includes "config".
   */
  const memoryInfo = new Map(
    (await REDIS.info("memory"))
      .split(/\r\n/)
      .map(line => line.match(/^(?<key>[^:]+):(?<value>.*)$/)?.groups)
      .filter(matched => matched)
      .map(({key, value}) => [key.replace(/_/g, "-"), value])
  );
  const maxmemoryPolicy = memoryInfo.get("maxmemory-policy");
  if (maxmemoryPolicy !== "volatile-ttl") {
    throw new Error(`Redis maxmemory-policy is "${maxmemoryPolicy}", but it *must* be "volatile-ttl".`);
  }
}


function herokuRedisClient(urlStr) {
  const url = new URL(urlStr);

  // Heroku Redis' TLS socket is documented to be on the next port up.  The
  // scheme for secure redis:// URLs is rediss://.
  if (url.protocol === "redis:") {
    utils.verbose(`Rewriting Redis URL <${scrubUrl(url)}> to use TLS`);
    url.protocol = "rediss:";
    url.port = Number(url.port) + 1;
  }

  const client = new Redis(url.toString(), {
    tls: {
      // It is pretty frustrating that Heroku doesn't provide verifiable
      // certs.  Although we're not using the Heroku Redis buildpack, the
      // issue is documented here nicely
      // <https://github.com/heroku/heroku-buildpack-redis/issues/15>.
      rejectUnauthorized: false
    }
  });

  client.scrubbedUrl = scrubUrl(url);

  return client;
}


function scrubUrl(url) {
  const scrubbedUrl = new URL(url);
  scrubbedUrl.password = "XXXXXX";
  return scrubbedUrl;
}


export {
  REDIS,
};
