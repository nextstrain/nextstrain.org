import sslRedirect from 'heroku-ssl-redirect';

import nakedRedirect from 'express-naked-redirect';
import express from 'express';
import compression from 'compression';

import { PRODUCTION, SERVER_MODE } from '../config.js';
import { addAsync } from '../async.js';
import * as authn from '../authn/index.js';
import { replacer as jsonReplacer } from '../json.js';
import * as middleware from '../middleware.js';


export function setupApp() {

  /* Express boilerplate.
   */
  const app = addAsync(express());

  app.set("json replacer", jsonReplacer);

  app.locals.production = PRODUCTION;
  app.locals.SERVER_MODE = SERVER_MODE;

  // In production, trust Heroku as a reverse proxy and Express will use request
  // metadata from the proxy.
  if (PRODUCTION) app.enable("trust proxy");

  app.use(middleware.rejectPostRequests);

  if (PRODUCTION) app.use(sslRedirect()); // redirect HTTP to HTTPS
  app.use(compression()); // send files (e.g. res.json()) using compression (if possible)
  app.use(nakedRedirect({reverse: true})); // redirect www.nextstrain.org to nextstrain.org
  app.use(middleware.rejectParentTraversals);

  /* Prevent shared (CDN) caches from storing responses. Exclude hashed build
   * assets so they retain their default long-lived cache headers in production.
   */
  app.use((req, res, next) => {
    if (!req.path.startsWith("/_next/static/") && !req.path.startsWith("/dist/")) {
      res.set("Cache-Control", "private, no-cache");
    }
    next();
  });

  /* Parse queries with `querystring` so that we can roundtrip queries using
   * `querystring.stringify` or the single-argument form of `url.format` (which
   * uses `querystring.stringify`)
   */
  app.set("query parser", "simple")


  /* Setup a request-scoped context object for passing arbitrary request-local
   * data between route and param middleware and route handlers.  Akin to
   * app.locals or res.locals.
   */
  app.use((req, res, next) => {
    req.context = {};

    // Set the app's origin centrally so other handlers can use it
    //
    // We can trust the HTTP Host header (req.hostname) because we're always
    // running behind name-based virtual hosting on Heroku.  A forged Host header
    // will be rejected by Heroku and never make it to us.
    req.context.origin = PRODUCTION
      ? `${req.protocol}://${req.hostname}`
      : `${req.protocol}://${req.hostname}:${req.app.get("port")}`;

    next();
  });

  /* Authentication (authn) setup.
   *
   * Routes:
   *   GET /login
   *   GET /logged-in
   *   GET /logout
   */
  authn.setup(app);


  /* CORS.
   *
   * After authn so it doesn't apply to those routes.
   */
  app.use(middleware.allowPublicReadOnlyCors);

  return app;
}
