# Static gazette blog (prototype)

> Entirely LLM generated; for LLM consumption

Serve blog posts as **fully static, self-contained pages served by Express,
entirely outside Next.js**. Every post now lives as a gazette project under
`blog/<id>/`, so Next.js no longer renders individual posts — the only blog
surfaces still on Next are the `/blog` index page and the RSS/Atom/JSON feeds,
both generated from the `blog/` sources (see "The `/blog` index and feeds"
below).

A gazette post needs no Next.js: gazette's `static` target already emits a
complete, self-hydrating page, and the only site chrome a post needs is the
header + footer, whose only dynamic part (the logged-in state) is fetched
client-side from `/whoami`. So a post is just gazette's static page with the
chrome injected into it.

This is a **prototype**. All posts have been moved under `blog/`, but only the
natively gazette-authored ones render correctly yet; the posts ported from the
old Next.js markdown blog still need their bodies converted to gazette syntax
(figures, cross-references, tables) before they will build as gazette pages.

## Pipeline

```
blog/<id>/<id>.md                         gazette source (authored)
   │  npm run build:gazette  (needs the gazette CLI)
   │    gazette build … --target pdf     -> .gazette-build/<id>/paper.pdf
   │    gazette build … --target static  -> .gazette-build/<id>/static/  (full page)
   │
   │  npm run snapshot:chrome  (next build + next start + snapshot)
   │    build the Next site, serve the PREBUILT build with `next start`,
   │    fetch /chrome-snapshot, extract real <Nav/>/<Footer/> + their CSS,
   ▼    scope under .site-chrome  -> .gazette-build/_chrome/{header,footer}.html, chrome.css
   │
   │  npm run build:static-blog
   ▼    copy .gazette-build/<id>/static/ -> blog-dist/<id>/ and inject the chrome
blog-dist/<id>/            index.html (+ gazette.css, tokens.css, gazette-runtime.js,
                           figures/, fonts/, assets/katex/, paper.pdf) — self-contained
blog-dist/_assets/         chrome.css (scoped Next CSS + module CSS), whoami-login.js
        │  Express (src/routing/staticBlog.js, before the Next catch-all)
        ▼
  GET /blog/<id>/  -> blog-dist/<id>/index.html     (/blog/<id> 301s to it)
  GET /blog/<id>/figures/… , /blog/_assets/…         relative + shared assets
  GET /blog/atom.xml , /blog/rss2.xml , /blog/feed.json  -> blog-dist/<feed>  (the feeds)
  GET /blog , /blog/                                  fall through to Next.js (the index)
```

`.gazette-build/` (intermediate) and `blog-dist/` (served) are both gitignored.

## The `/blog` index and feeds

Both read the gazette post sources directly from `blog/<id>/<id>.md`:

- the **`/blog` index page** (`static-site/app/blog/page.tsx`) is still rendered
  by Next.js; it lists every post by its `title`/`date`/`authors` frontmatter,
  linking to `/blog/<id>` (served by Express per the pipeline above).
- the **RSS/Atom/JSON feeds** (`static-site/src/util/blogFeeds.js`, run by
  `npm run build:feeds` → `scripts/generate-blog-feeds.js`) are written to
  `blog-dist/{atom.xml,rss2.xml,feed.json}` and served by Express (the same
  `express.static` middleware as the posts, which also sets their feed MIME
  types). Each entry carries the post's abstract — extracted by the
  `gazette abstract <file>` CLI — as a short excerpt plus a link to the post.
  The full gazette body is deliberately *not* embedded, because its
  `:::figure` directives, ```` ```yaml gazette ```` blocks and `[@fig:id]`
  cross-references do not render as plain Markdown.

## The chrome is generated from the real components (no drift)

The header/footer are **not** hand-authored. `app/chrome-snapshot/page.tsx` is a
Next route that renders the real `<Nav/>` and `<Footer/>` (each wrapped in a
unique custom element).

That route exists only for the snapshot, so it is **hidden from the public
site**: the Express server 404s `/chrome-snapshot` (src/routing/staticBlog.js),
and every public request reaches the site through Express. Snapshotting therefore
serves the route with Next's own server instead — `snapshot-chrome.sh` runs
`next build` then `next start` on a private port (bypassing Express), and
`snapshot-chrome.mjs` fetches that page over HTTP and pulls out:

- the two markup fragments (real hashed CSS-module class names, real
  react-icons SVGs, the real team avatars and funder logos — zero shims), and
- the CSS the page links (`/_next/static/css/…`: the global CSS **and** the
  components' CSS-module rules, hashes matching the markup),

then scopes all the CSS under `.site-chrome` (and converts `rem`→px, since
gazette owns the document root). So the chrome on a blog page is byte-for-byte
the site's real chrome; it cannot drift.

The chrome's images are Next's hashed asset URLs (`/_next/static/media/…`), which
Next serves — so those assets, and only those, still come from Next at runtime.
**The snapshot and the serving Next build must be the same build**, since those
hashes move each build. In production that holds: the build is produced once and
both the snapshot and the server use it. So the order is: `next build` →
`snapshot:chrome` (which **reuses** that build by default) → start the prebuilt
server (`USE_PREBUILT_STATIC_SITE=1`). `snapshot:chrome` only rebuilds if you
pass `--build`, which prints a loud warning because a fresh build is correct
only if that same build is also the one served.

## What gazette's `static` target gives us (so we don't build it)

- A complete `index.html`: `<article class="gazette-paper">` in the light DOM,
  with an **inline `<script type="module">` per figure** that imports the
  module, fetches its data and renders it. No manifest, no React.
- `gazette-runtime.js` — a tiny `document`-level `.gazette-trigger` click
  delegate. The only shared script gazette needs.
- `gazette.css` isolates itself with native **`@scope (.gazette-paper) to
  (.gazette-mount--light)`** — gazette's styles apply inside the article but
  stop at light-DOM figure mounts (so embedded Auspice etc. render unaffected).
  No shadow DOM, and the content is styled even with no JS.

So there are **no companion runtime components** to generate or vendor (the old
`next` target needed `GazettePaper`/`GazetteHydrator`); this path uses none.

## The three style domains (why nothing leaks)

1. **gazette.css / tokens.css** — `@scope`d to `.gazette-paper`; cannot escape.
2. **chrome.css** — Next's real global CSS (`globals.css`, `bootstrap.css`,
   `browserCompatability.css`) + the chrome styles, run through `scope-css.mjs`
   so **every rule is confined to `.site-chrome`** (the header/footer wrappers).
   `body {…}` becomes `.site-chrome {…}`, `p {…}` becomes `.site-chrome p {…}`.
3. gazette owns `<html>`/`<body>`; it sets `html { font-size: 18px }`. The
   chrome's Next CSS assumes the site's `62.5%` (1rem = 10px) base, so
   `scope-css.mjs` also **converts the chrome's `rem` to absolute px** at build
   time, making the chrome independent of gazette's root font-size.

The chrome and the article are mutually non-overlapping; the only shared surface
is gazette's two global `html`/`body` rules, which the chrome overrides within
`.site-chrome`.

## Files

| File | Role |
| --- | --- |
| `build-gazette-blog.sh` | `npm run build:gazette`: runs the gazette CLI (pdf + static) into `.gazette-build/`. Compile only. |
| `snapshot-chrome.sh` | `npm run snapshot:chrome [--build]`: `next start` the existing build + snapshot (default). `--build` runs a fresh `next build` first (warns; only safe if that build is also served). Serves the hidden chrome route via Next (not Express). |
| `snapshot-chrome.mjs` | The snapshot worker: fetch `/chrome-snapshot` from a given Next server URL, extract the real `<Nav/>`/`<Footer/>` + their CSS, scope it, write `.gazette-build/_chrome/`. |
| `build-static-blog.mjs` | `npm run build:static-blog`: copy gazette's static bundle into `blog-dist/<id>/`, inject the snapshotted chrome, write `blog-dist/_assets/`. |
| `scope-css.mjs` | PostCSS transform: confine a stylesheet under `.site-chrome` and convert its `rem` to px. |
| `whoami-login.js` | Client-side `/whoami` fetch that swaps the LOGIN link. |
| `../../static-site/app/chrome-snapshot/page.tsx` | The Next route that renders the real chrome for the snapshot (404ed by Express; served only via `next start`). |

## Build & run

```sh
conda activate nextstrain.org              # provides the `gazette` CLI
./build.sh static                           # next build (+ feeds + build:gazette)
./build.sh blog                             # snapshot chrome + inject -> blog-dist/
USE_PREBUILT_STATIC_SITE=1 npm run server   # serve the prebuilt site (prod-like)
# open http://localhost:5000/blog/<id>/
```

`./build.sh all` runs `build-static` then `build-blog` in that order. The
individual pieces (`npm run build:gazette`, `snapshot:chrome`,
`build:static-blog`) can still be run by hand; `snapshot:chrome` reuses the
existing `next build` by default, so run `./build.sh static` (or `next build
static-site`) first.

## Known prototype shortcuts / TODO

- The snapshot references Next's hashed asset URLs (`/_next/static/media/…`) for
  the logo/avatars/logos, so **the snapshot build and the serving build must
  match**. This is now wired into `build.sh`: `build-static` runs `next build`,
  then `build-blog` runs `snapshot:chrome` (which reuses that build by default)
  and `build:static-blog`. `build-blog` refuses to run if `next build` hasn't
  produced `static-site/.next/BUILD_ID`. Run the server on that same build
  (`USE_PREBUILT_STATIC_SITE=1`).
- Caching headers on the served files are disabled for iteration; set real
  `Cache-Control` (and content hashing) for production.
- `<head>` metadata is gazette's defaults; richer OpenGraph/JSON-LD (as the old
  Next.js blog-post renderer emitted) could be injected from the gazette
  frontmatter.
