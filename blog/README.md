# Nextstrain.org blog

The nextstrain.org blog is built using `gazette`, a separate tool which turns custom markdown documents into standalone statically-servable HTML pages with the ability to have custom interactive figures.
We post-process these HTML pages to add our typical nextstrain.org header / footer elements to them, and the resulting page is served by our express server.


## Creating a new blogpost / developing a new blogpost:

#### Initialise a new blogpost

```sh
npm run blog:init -- YYYY-MM-DD-TITLE
```

For example `npm run blog:init -- 2026-11-11-measles-update`.
The resulting markdown file will have some boilerplate YAML frontmatter and details about markdown functionality available.
Additionally an empty `blog/<ID>/figures/` directory is created for static figures / interactive code.

#### Edit (with live reloading) a blogpost

`npx gazette dev blog/YYYY-MM-DD-TITLE/YYYY-MM-DD-TITLE.md`

(`npx` runs the `gazette` installed in `node_modules`; see below.)


## Steps to building the blogposts for the live site:

> These steps are run by our main `build.sh` pipeline

1. `npm run build:gazette` uses `gazette` to render interactive HTML versions of the blogposts
2. `npm run snapshot:chrome` renders a (hidden) next.js page with the header & footer and snapshots the HTML & CSS
3. `npm run build:static-blog` combines the gazette HTML pages with the header & footer elements to produce the final blog posts
4. `npm run build:feeds` to build RSS feeds of the blog



## The `gazette` tool

> Work in progress

`gazette` is a project dependency, currently installed from GitHub and pinned to a commit
in `package.json` (it is not published to the npm registry).

To bump the pinned version, re-install from a new ref, e.g.
`npm install 'github:jameshadfield/gazette#<commit>'`, and commit the updated
`package.json` + `package-lock.json`.

#### Developing against a local `gazette` checkout

To work against a local source copy of gazette (e.g. developing a feature in
gazette alongside a blog post), install it from your local path **in place of**
the pinned GitHub version:

```sh
npm install ../path/to/gazette      # relative or absolute path to your checkout
```

npm symlinks `node_modules/gazette` to your checkout, so `npm run build:gazette`
and `npx gazette …` transparently use it — no script changes needed. Note this
rewrites the `gazette` line in `package.json` to a `file:` path, so **do not
commit that change**. When you're done, restore the pinned version:

```sh
git checkout package.json package-lock.json
npm install
```
