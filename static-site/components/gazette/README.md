# gazette companion components

These two components embed a **gazette** document (built with `gazette build
--target next`) into this Next.js app:

- `GazettePaper.jsx` — a **server component**. Drops the bundle's
  `article.html` into the light DOM via `dangerouslySetInnerHTML`, so the
  document is server-rendered, crawlable, printable, and visible with
  JavaScript disabled.
- `GazetteHydrator.jsx` — a **client component** (`"use client"`). On mount it
  attaches a single open shadow root to the host element, loads gazette's
  `gazette.shadow.css`, moves the article inside the shadow root (one isolated
  style boundary — gazette's CSS cannot leak into nextstrain.org, and our
  global CSS cannot reach in), hydrates each interactive figure island, and
  scopes `:trigger` clicks / in-document anchor jumps to the shadow root.

`GazettePaper.jsx` imports `./GazetteHydrator`, so the two files must live
together.

## ⚠️ These two `.jsx` files are generated — do not edit them

They are emitted by the gazette CLI and are **build output** (gitignored, like
the compiled bundles). `npm run build:gazette` regenerates them via:

```sh
gazette runtime --target next --out static-site/components/gazette
```

So there is no longer a hand-maintained copy to keep in sync: the canonical
source lives in the gazette repo (`runtime/next/`), and the CLI copies it here.
Keeping the files inside this directory (rather than importing across into the
gazette repo via `experimental.externalDir`) keeps them in Next's compilation
root; they have no third-party dependencies beyond `react`.

Fix or change the components in the gazette repo, then re-run the command above
(or `npm run build:gazette`) — never edit these copies, your changes will be
overwritten on the next build.

Only this `README.md` is committed; the generated `.jsx` files are not. A fresh
checkout must run `npm run build:gazette` (which needs the `gazette` CLI) before
`next build`.

They are `.jsx` (the form the CLI emits). `allowJs` is on and `checkJs` is off
in `tsconfig.json`, so they are compiled but not type-checked.

## How they are wired in

- The bundle is built into `public/gazette/<id>/` — see
  `npm run build:gazette` (defined in the repo-root `package.json`).
- `app/blog/gazette.ts` reads a bundle (`article.html` + `manifest.json`) from
  disk at build time.
- `app/blog/[id]/page.tsx` renders `<GazettePaper>` for any blog id that has a
  built bundle, and otherwise falls through to the normal markdown path.
