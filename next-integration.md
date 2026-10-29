# Integrating gazette into a Next.js app

This document is a standalone brief for integrating **gazette**'s `next` target
into an existing Next.js application. It assumes you are working inside that app
and have *not* seen gazette's own repo history. Everything you need is here.

gazette lives at `/Users/naboo/projects/2026-10_gazette` (the "gazette repo"
below). The app you are integrating into is the "host app".

The conda environment we are working in has the CLI `gazette` available and working.

---

## 1. What gazette's `next` target produces

gazette compiles one Markdown source (prose + YAML frontmatter, `$…$` math,
`[@key]` citations, `[@fig:slug]` cross-references, and `:::figure` interactive
figures) into a **self-contained bundle** you drop into the host app's `public/`
directory and render through two small companion React components.

A built bundle (for one document, under a base path e.g. `/gazette/<id>`) is:

```
public/gazette/<id>/
  article.html         server-rendered document body (frontmatter header + prose +
                       math + figure mounts + references). NO <html>/<body>/<article>
                       wrapper — just the inner HTML.
  manifest.json        hydration manifest: interactive figures (islands), triggers,
                       frontmatter, and the stylesheet URL. All asset URLs inside
                       are absolute, rewritten against the base path.
  gazette.shadow.css   ONE stylesheet (theme tokens + structural CSS + KaTeX),
                       authored to live inside a shadow root (:root/html/body
                       rewritten to :host).
  fonts/               web fonts referenced by gazette.shadow.css
  assets/katex/        KaTeX fonts (its CSS is inlined into gazette.shadow.css)
  figures/             the document's figure component modules (.js), their named
                       datasets (data/*.json), the author's figures/lib/, and the
                       static fallback image(s) <slug>.png
```

### How it renders in the host

- **`GazettePaper`** (a **server component**) drops `article.html` into the light
  DOM via `dangerouslySetInnerHTML`. This is server-rendered HTML — crawlable,
  printable, and visible with JavaScript disabled, exactly like a markdown post.
- **`GazetteHydrator`** (a **client component**, `"use client"`) runs on mount and:
  1. attaches a **single open shadow root** to the host element,
  2. loads `gazette.shadow.css` and moves the article inside the shadow root
     (one isolated style boundary for the whole document — gazette's CSS cannot
     leak into the host app, and the host's global CSS cannot reach in),
  3. hydrates each interactive figure from the manifest (dynamic-imports the
     component module, fetches its datasets, measures the mount, calls the
     figure's `render(...)`, hides the static fallback, wires `resize` and the
     `gazette:update` event),
  4. scopes `:trigger` button clicks and in-document `#fig`/`#ref` anchor jumps
     to the shadow root (IDs inside a shadow tree are invisible to
     `document.getElementById`, and native `#fragment` scrolling doesn't cross
     the boundary).

> **Why client-side shadow attach?** React 18 does not render declarative shadow
> DOM, so the article is server-rendered into light DOM first (for no-JS /
> crawlers / print) and relocated into the shadow root once JS runs. If the host
> is on **React 19**, see §9.

---

## 2. Prerequisites & assumptions

This integration is designed and verified against:

- **Next.js App Router** (the `app/` directory).
- **React 18**.
- **webpack** (the Next default). If you run `next dev --turbo` / use Turbopack,
  see the `webpackIgnore` note in §8.
- The route that renders documents uses the **Node.js runtime** (the default).
  It must *not* be `export const runtime = "edge"`, because the loader reads the
  bundle from disk with `node:fs` (see §5).

If the host uses the Pages Router or React 19, the bundle format is identical;
only the companion components change. Flag this and adapt §4/§6.

---

## 3. Use the gazette CLI to build a bundle for each blog post

You need to run gazette's CLI (this on PATH) to produce the bundle.

Importantly, for this MVP work we are going to have a single gazette blog post.
The source code for this is present at `blog/2026-10-30-gazette-example`.
This can be built (compiled etc) via:


```sh
gazette build <path-to-gazette-doc> --target next --base-path /gazette/<id> --out ./public
```


Key flags:

- `<path-to-gazette-doc>` — a **project directory** containing `gazette.config.yaml`
  (entry `paper.md`, `figures_dir`, `bib`, …), or a Markdown file directly. See
  `/Users/naboo/projects/2026-10_gazette/examples/basic/` for the canonical shape.
- `--base-path /gazette/<id>` — the **URL prefix** the bundle will be served from.
  Because the host serves `public/` at `/`, building `--out ./public` with
  `--base-path /gazette/<id>` lands assets at `public/gazette/<id>/…`, served at
  `/gazette/<id>/…`. **The base path must equal the served path**; the manifest's
  module/data/stylesheet URLs are rewritten against it. Use a **distinct base
  path per document** (e.g. the blog id) so bundles don't collide.
- `--out ./public` — resolved against the current working directory (run this
  from the host app root).

Run this once per gazette-authored document. Wire it into the host's build (a
`prebuild` script, a loop over your gazette docs, or a Makefile) so bundles are
regenerated when sources change. Treat `public/gazette/**` as build output
(gitignore it, or commit it — your choice).

---

## 4. Copy the companion components into the host app

The two components are the gazette repo's canonical source:

- `/Users/naboo/projects/2026-10_gazette/runtime/next/GazettePaper.jsx`
- `/Users/naboo/projects/2026-10_gazette/runtime/next/GazetteHydrator.jsx`

For now, we'll copy those into the host app (e.g. `components/gazette/` or
`app/_gazette/`), however in the future `gazette` should produce these for us,
so make a note of this in a README document. 

They have no third-party dependencies beyond `react`. Copying
avoids packaging/`exports`-map work and keeps them inside the Next compilation
root. You may rename them to `.tsx` and add prop types if you prefer; the logic
is unchanged.

> gazette's own example app imports them from the repo via
> `experimental.externalDir`, but that is only because the example lives *inside*
> the gazette repo. In a separate host app, **copy them** — do not reach across
> into `/Users/naboo/projects/...` from your app.

After copying, the import in your route is just a local path, e.g.:

```tsx
import { GazettePaper } from "@/components/gazette/GazettePaper";
```

`GazettePaper.jsx` imports `./GazetteHydrator`, so keep the two files together.

---

## 5. Add the bundle loader

Create a small server-side helper that reads a bundle at build/request time.
Adapt the id→bundle mapping to how the host identifies gazette-authored posts
(a filesystem check is simplest; a frontmatter flag also works — see §6).

```ts
// lib/gazette.ts
import fs from "node:fs";
import path from "node:path";

export interface GazetteManifest {
  basePath: string;
  stylesheet: string;
  frontmatter: Record<string, unknown>;
  islands: Array<{
    figId: string;
    mountId: string;
    module: string;                      // absolute URL, e.g. /gazette/<id>/figures/trend-line.js
    data: Record<string, string>;        // key -> absolute dataset URL
    opts: Record<string, unknown>;
  }>;
  triggers: Array<{ target: string; update: unknown }>;
}

// public/gazette/<id>/ holds the bundle for blog id <id>.
function bundleDir(id: string): string {
  return path.join(process.cwd(), "public", "gazette", id);
}

export function gazetteBuildExists(id: string): boolean {
  return fs.existsSync(path.join(bundleDir(id), "manifest.json"));
}

export function loadGazetteBuild(id: string): {
  articleHtml: string;
  manifest: GazetteManifest;
} {
  const dir = bundleDir(id);
  const articleHtml = fs.readFileSync(path.join(dir, "article.html"), "utf8");
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dir, "manifest.json"), "utf8"),
  ) as GazetteManifest;
  return { articleHtml, manifest };
}
```

`process.cwd()` is the app root in both `next dev` and `next build`. The files
live under `public/`, so they are present in any deployment; just keep the route
on the Node runtime (§2).

---

## 6. Wire the route

The host's document route needs a single branch: if this id has a gazette build,
render `<GazettePaper>`; otherwise fall through to the existing path.

In the host's `app/blog/[id]/page.tsx` (the server component that currently does
`markdownToHtml(...)` + `dangerouslySetInnerHTML`), add near the top of the
component body, **before** the markdown rendering:

```tsx
import { GazettePaper } from "@/components/gazette/GazettePaper";
import { gazetteBuildExists, loadGazetteBuild } from "@/lib/gazette";

// ...inside the default export, after you have `id`:
if (gazetteBuildExists(id)) {
  const { articleHtml, manifest } = loadGazetteBuild(id);
  return <GazettePaper articleHtml={articleHtml} manifest={manifest} />;
}
// ...existing markdown path unchanged below...
```

Notes for this specific host app:

- Keep `generateStaticParams()` as-is — gazette-backed ids can come from the same
  `getBlogPosts()` list; they just render via the gazette branch.
- `generateMetadata()` can stay on the markdown path, or read
  `loadGazetteBuild(id).manifest.frontmatter` (title, authors, date, citation)
  for gazette posts. The manifest's `frontmatter` mirrors the document's YAML.
- The gazette branch returns early, so the sidebar/archive chrome in the existing
  layout won't wrap it. If you want the gazette paper to sit *inside* the same
  `container/row/col` shell, render `<GazettePaper>` where the
  `styles.blogPostBody` div currently goes instead of returning early. The shadow
  root keeps gazette's styles from touching your Bootstrap-ish layout either way.

**Deciding which ids are gazette-backed:** `gazetteBuildExists(id)` (filesystem)
needs no change to your post model. Remember, for this MVP we have a single blog
post. 

---

## 7. Build, run, and verify

```sh
# 1. Build the bundle(s) into public/ (run from the host app root):
gazette build \
  <path-to-gazette-doc> --target next --base-path /gazette/<id> --out ./public

# 2. Run the host app:
npm run dev
# open the document route, e.g. http://localhost:3000/blog/<id>
```

Confirm in the browser:

- The document renders with gazette's typography (serif headings, hairline rules)
  and the **host app's own global CSS is unchanged** around it.
- The interactive figure appears (the static `<slug>.png` fallback is replaced by
  the live island); resizing the window reflows it.
- `:trigger` controls in the prose drive the figure (e.g. toggling a log scale).
- Math renders via KaTeX with correct fonts.
- Clicking a `[@fig:…]` / citation link scrolls within the document.
- In DevTools, the document lives under `#shadow-root (open)` on the
  `.gazette-host` element; gazette's styles are scoped there.
- With JS disabled, the prose/figures-fallback/math are still present (unstyled —
  see §8).

---

## 8. Gotchas & troubleshooting

- **Base path mismatch.** If figures/fonts 404, the `--base-path` used at build
  time doesn't match where the bundle is served. They must be identical
  (`/gazette/<id>` ↔ `public/gazette/<id>/`). Rebuild with the right `--base-path`.
- **Turbopack and dynamic imports.** `GazetteHydrator` loads figure modules with
  `import(/* webpackIgnore: true */ island.module)` so the bundler leaves them as
  runtime ESM fetched from `public/`. This magic comment is a **webpack** feature.
  With `next dev --turbo` it may be ignored and Turbopack may try to resolve the
  module at build time. Use the default webpack dev/build, or adapt the import.
- **Edge runtime.** The loader uses `node:fs`; keep the route on the Node runtime
  (don't set `runtime = "edge"`).
- **No-JS content is unstyled.** gazette's CSS lives only inside the shadow root,
  which is attached by JS. Without JS the article is semantically present (good
  for crawlers/SEO) but has no gazette styling. This is an accepted trade-off of
  the single-shadow-root design. If you need styled no-JS output, you'd add a
  light-DOM scoped stylesheet — not part of this integration.
- **`@font-face` inside shadow DOM.** gazette keeps `@font-face` inline in
  `gazette.shadow.css`. Modern browsers register these fonts fine. If a target
  browser fails to load them, move the `@font-face` rules to a
  `document.head`-injected `<style>` (fonts are document-scoped and harmless at
  the document level) and leave the rest in the shadow root.
- **React StrictMode double-invoke.** `GazetteHydrator` guards with
  `if (host.shadowRoot) return`, so a second effect run (dev StrictMode) is a
  no-op. Don't remove that guard.
- **One host per document.** `GazettePaper` renders one `.gazette-host`. Rendering
  several gazette documents on one page is fine (each gets its own shadow root);
  they do not share state.

---

## 9. React 19 (if/when the host upgrades)

React 19 renders declarative shadow DOM. You could then have `GazettePaper` emit
`<template shadowrootmode="open">` containing `gazette.shadow.css` + the article,
so the shadow root exists at parse time with **no client relocation** and styled
no-JS content. `GazetteHydrator` would shrink to just island hydration + the
trigger/anchor delegation. The bundle format (`article.html` / `manifest.json` /
assets) does not change — only the components. Treat this as an optional later
improvement, not part of the initial integration.

---

## 10. Authoring the gazette documents (figure contract)

The host only consumes bundles; the document and its figures are authored in the
gazette project. For reference, each interactive figure is an ES module exporting:

```js
// render(container, data, opts) -> lifecycle object
export function render(container, data, opts = {}) {
  // data = { <key>: parsedJsonOfNamedDataset, ... }
  // opts = { mode: "inline", width: <measured px>, ...authorOpts }
  // Pure: NO fetching, NO ResizeObserver — the host owns data loading + resize.
  return {
    element,                 // optional
    resize(width) { ... },   // called on container resize (width in px)
    update(arg) { ... },     // called when a :trigger fires; arg is the typed payload
    destroy() { ... },       // optional cleanup
  };
}
```

- Datasets are `.json` files referenced by name in the figure's YAML block; the
  host assembles them into `data` and passes the measured `width` in `opts`.
- Figure libraries (d3 / Observable Plot / helpers) are **author-owned**, live in
  the document's `figures/lib/`, and travel with the bundle — the host bundles
  nothing for them.
- `:trigger[label]{target=fig:slug update=…}` payloads are authored as inline
  flow-YAML and delivered to `update(arg)` as the parsed value (string, number,
  or object).

See `/Users/naboo/projects/2026-10_gazette/README.md` and
`/Users/naboo/projects/2026-10_gazette/examples/basic/` for the full figure
directive syntax and a worked example. A live example host (mirroring §4–§6) is
at `/Users/naboo/projects/2026-10_gazette/examples/next/`.
