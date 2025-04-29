/**
 * Analytics for server-side events.
 *
 * @module analytics
 */
import { default as UserAgentBag } from "user-agent-bag";
import { PLAUSIBLE_ANALYTICS_DOMAIN, PLAUSIBLE_ANALYTICS_ENDPOINT } from "./config.js";
import { fetch } from "./fetch.js";


/**
 * Generate middleware to record an analytics event via a request to
 * Plausible's API.
 *
 * Intended for use in an Express routing chain.  The generated middleware
 * function does not block on the analytics request before returning.
 *
 * If the User-Agent of the incoming request starts with "Nextstrain-CLI/",
 * then it is parsed for several bits of information and those are
 * automatically attached to the analytics event as custom properties.
 *
 * @function recordEvent
 * @param {object} data
 * @param {string} data.name - Event name.  Defaults to "pageview" (Plausible's default).
 * @param {object} data.props - Custom properties.  Defaults to {}.
 * @param {boolean} data.interactive - Interactive session or not?  Defaults to
 *   false (opposite of Plausible's default), with the reasoning that most events
 *   we're likely to record server-side aren't for interactive browser-based
 *   sessions.
 * @returns {expressMiddlewareAsync}
 */
export const recordEvent = ({name = "pageview", props = {}, interactive = false} = {}) => async (req, res, next) => {
  if (PLAUSIBLE_ANALYTICS_DOMAIN) {
    /* We intentionally do not "await fetch()" as we do not want to block
     * request processing on analytics; we'd rather ignore failures.
     *    -trs, 28 April 2025
     */
    fetch(
      // <https://plausible.io/docs/events-api>
      PLAUSIBLE_ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: {
          "User-Agent": req.header("User-Agent"),
          "X-Forwarded-For": req.ip,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          domain: PLAUSIBLE_ANALYTICS_DOMAIN,
          url: new URL(req.originalUrl, req.context.origin),
          referrer: req.header("Referer"),
          interactive,
          props: {
            // <https://plausible.io/docs/custom-props/introduction>
            ...propsFromUserAgent(req.header("User-Agent")),
            ...props,
          },
        }),
      }
    );
  }
  return next();
};


const userAgentToPlausibleKeys = new Map([
  ["Nextstrain-CLI",  "nextstrain-cli/version"],
  ["Python",          "nextstrain-cli/python"],
  ["installer",       "nextstrain-cli/installer"],
  ["platform",        "nextstrain-cli/platform"],
  ["tty",             "nextstrain-cli/tty"],
]);

function propsFromUserAgent(ua) {
  if (ua && ua.match(/^Nextstrain-CLI\//)) {
    const uaComponents = new UserAgentBag(ua);

    return Object.fromEntries(
      Array.from(userAgentToPlausibleKeys)
        .map(([srcKey, dstKey]) => [dstKey, uaComponents.get(srcKey) ?? null])
    );
  }

  return {};
}
