import express from 'express';
import fs from 'fs';
import path from 'path';
import { NotFound } from '../httpErrors.js';

/**
 * Serve gazette-authored blog posts as fully static, self-contained pages,
 * outside Next.js (PROTOTYPE — see scripts/gazette-blog/).
 *
 * Each post is built to blog-dist/<id>/ (a complete gazette `static` page with
 * the site chrome injected, plus its own figures/fonts/css/runtime). The page
 * uses relative asset URLs, so it must be served under a trailing-slash path
 * (/blog/<id>/) for those to resolve.
 *
 *   - GET /blog/<id>   -> 301 /blog/<id>/   (only when a post is built)
 *   - GET /blog/<id>/  -> blog-dist/<id>/index.html
 *   - GET /blog/<id>/figures/… , /blog/_assets/chrome.css -> the files
 *   - GET /blog/atom.xml , /blog/rss2.xml , /blog/feed.json -> the blog feeds,
 *     written to blog-dist/ by `npm run build:feeds` (static-site/src/util/
 *     blogFeeds.js) and served here by the same express.static middleware.
 *   - GET /blog , /blog/ -> fall through to Next.js (the /blog index page).
 *
 * We do the /blog/<id> -> /blog/<id>/ redirect ourselves, gated on the post
 * existing, rather than letting express.static's directory redirect do it:
 * express.static would also redirect /blog -> /blog/, which Next.js then
 * redirects back to /blog (trailingSlash: false), causing a loop. So
 * express.static runs with redirect:false and only serves files.
 *
 * MUST be set up BEFORE staticSite (the Next.js catch-all).
 */
export function setup(app) {
  const distDir = path.join(process.cwd(), "blog-dist");

  /* Hide the chrome-snapshot route (static-site/app/chrome-snapshot) from the
   * public site. It exists only so the build can snapshot the real <Nav/> and
   * <Footer/> for the static blog (see scripts/gazette-blog/). It is present in
   * the Next.js build, so snapshotting fetches it directly from `next start`
   * (which bypasses this server); every public request reaches the site through
   * this Express app, so 404ing it here keeps it off the deployed site.
   * Registered before the Next.js catch-all so Next never serves it.
   *
   * We rewrite req.url to a non-existent path before 404ing. A plain
   * `next(new NotFound())` is not enough: for browser-like GETs the error
   * handler (src/routing/errors.js) delegates 404s back to Next.js to render the
   * styled 404 page — and Next.js, handed the real `/chrome-snapshot` URL, would
   * render the actual route (HTTP 200). Pointing it at a path with no route
   * makes that delegated render a genuine not-found. */
  app.use("/chrome-snapshot", (req, res, next) => {
    req.url = "/_chrome-snapshot-hidden";
    next(new NotFound());
  });

  const hasPost = (id) =>
    !!id &&
    !id.includes("/") &&
    !id.includes("\\") &&
    !id.includes("..") &&
    fs.existsSync(path.join(distDir, id, "index.html"));

  // Add the trailing slash for a built post (so its relative assets resolve).
  // Skip paths that already end in "/" to avoid redirecting to themselves.
  app.get("/blog/:id", (req, res, next) => {
    if (!req.path.endsWith("/") && hasPost(req.params.id)) {
      return res.redirect(301, `/blog/${req.params.id}/`);
    }
    return next();
  });

  // Proper MIME types for the blog feeds (express.static would otherwise serve
  // the .xml files as generic application/xml).
  const feedContentType = {
    "atom.xml": "application/atom+xml; charset=utf-8",
    "rss2.xml": "application/rss+xml; charset=utf-8",
    "feed.json": "application/feed+json; charset=utf-8",
  };

  // Serve the built pages, their assets, and the feeds; fall through otherwise.
  app.use(
    "/blog",
    express.static(distDir, {
      index: "index.html",
      redirect: false,     // we own the /blog/<id> -> /blog/<id>/ redirect
      fallthrough: true,   // unknown paths fall through to Next.js
      maxAge: 0,           // prototype: don't cache while iterating
      setHeaders: (res, filePath) => {
        const contentType = feedContentType[path.basename(filePath)];
        if (contentType) res.setHeader("Content-Type", contentType);
      },
    }),
  );
}
