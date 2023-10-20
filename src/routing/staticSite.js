import * as endpoints from '../endpoints/index.js';


/** Gatsby static HTML pages and other assets.
 *
 * Any URLs matching Gatsby's static files will be handled here, e.g.
 * static-site/public/influenza/index.html will be served for /influenza.
 *
 * When a Gatsby dev server is in use, assets are proxied from the dev server
 * instead of served straight from disk.
 */
export async function setup(app) {
  if (app.locals.gatsbyDevUrl) {
    const {createProxyMiddleware} = await import("http-proxy-middleware");

    // WebSocket endpoint
    app.get("/socket.io/", createProxyMiddleware(app.locals.gatsbyDevUrl, { ws: true }));

    /* This is the end of the line in gatsbyDevUrl mode, as the proxy middleware
     * doesn't fallthrough on 404 and even if it did the Gatsby dev server
     * returns a 200 Ok for missing pages.
     */
    app.use(createProxyMiddleware(app.locals.gatsbyDevUrl));
  } else {
    app.use(endpoints.static.gatsbyAssets);
  }
}
