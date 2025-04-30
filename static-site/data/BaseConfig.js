// This file contains basic configuration information that is used in
// non-React contexts, such that putting it into `SiteConfig.jsx`
// would not work. Everything that is exported from this file will
// be re-exported from `SiteConfig.jsx`.

export const siteTitle = "Nextstrain";

// Alternative site title for SEO.
export const siteTitleAlt = "Real-time tracking of pathogen evolution";

// Logo used for SEO
export const siteLogo = "/nextstrain-logo-small.png";

export const siteUrl = "https://nextstrain.org";

// Website description used for RSS feeds/meta description tag.
export const siteDescription = "Real-time tracking of pathogen evolution";

export const groupsApp = false;

export const groupsTitle = "Scalable Sharing with Nextstrain Groups";

export const blogUrl = `${siteUrl}/blog`;

export const blogDescription = "Updates from the Nextstrain core team";

export const blogFeeds = {
  atom: `atom.xml`,
  json: `feed.json`,
  rss2: `rss2.xml`,
}
export const blogFeedUrls = Object.fromEntries( Object.entries(blogFeeds).map(([k,v]) => [k, `${blogUrl}/${v}`]));

/*
  See <https://plausible.io/docs/plausible-script>. Analytics are
  disabled on localhost, but use `script.local.js` if you want to
  track localhost for testing purposes. If you want to disable all
  analytics, set both of these constants to `undefined`.
*/
export const plausibleAnalyticsScript = "https://plausible.io/js/script.js";
export const plausibleAnalyticsDataDomain = "nextstrain.org";

