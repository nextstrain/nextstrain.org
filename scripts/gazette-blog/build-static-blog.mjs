#!/usr/bin/env node
// build-static-blog.mjs — assemble the served blog pages by injecting the
// snapshotted header + footer into the gazette-produced (interactive) HTML pages
//
// gazette's `static` target (see scripts/build-gazette-blog.sh) already emits a
// complete, self-hydrating page per post: a `.gazette-paper` article with
// its CSS confined with native @scope, a tiny `gazette-runtime.js`,
// and an inline hydration script per figure.
//
// The site header/footer are snapshotted from the REAL <Nav/>/<Footer/>
// components by snapshot-chrome.mjs (approach "A"), which writes
// .gazette-build/_chrome/{header.html,footer.html,chrome.css}. This step just
// injects those fragments (wrapped in `.site-chrome`, whose CSS is scoped so it
// cannot touch gazette's article) and the login script into each gazette page,
// and copies the self-contained bundle into the served tree blog-dist/<id>/.
//
// Run from the repo root (via `npm run build:static-blog`, or automatically at
// the end of `npm run build:gazette`). Requires the chrome snapshot to exist
// (run `npm run snapshot:chrome`).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const gazetteBuildDir = path.join(repoRoot, ".gazette-build");
const chromeDir = path.join(gazetteBuildDir, "_chrome");
const distDir = path.join(repoRoot, "blog-dist");
const assetsDir = path.join(distDir, "_assets");

/** Load the chrome snapshot (fail with guidance if it hasn't been generated). */
function loadChrome() {
  const need = ["header.html", "footer.html", "chrome.css"];
  for (const f of need) {
    if (!fs.existsSync(path.join(chromeDir, f))) {
      console.error(`Missing chrome snapshot (.gazette-build/_chrome/${f}).`);
      console.error(`Generate it with a Next server running:`);
      console.error(`  npm run dev           # in one shell`);
      console.error(`  npm run snapshot:chrome`);
      process.exit(1);
    }
  }
  return {
    header: fs.readFileSync(path.join(chromeDir, "header.html"), "utf8").trim(),
    footer: fs.readFileSync(path.join(chromeDir, "footer.html"), "utf8").trim(),
    cssPath: path.join(chromeDir, "chrome.css"),
  };
}

/** Write blog-dist/_assets/: the scoped chrome CSS and the login script. */
function buildSharedAssets(chrome) {
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.copyFileSync(chrome.cssPath, path.join(assetsDir, "chrome.css"));
  fs.copyFileSync(path.join(here, "whoami-login.js"), path.join(assetsDir, "whoami-login.js"));
}

/** Inject the chrome <link> into <head> and the header/footer into <body>. */
function injectChrome(html, chrome) {
  // chrome.css carries the site's self-hosted Lato (@font-face) and defines
  // --lato on .site-chrome (re-homed in snapshot-chrome.mjs), so no external
  // font link is needed.
  const headLinks = `  <link rel="stylesheet" href="/blog/_assets/chrome.css" />
`;

  const footerBlock = `<div class="site-chrome">${chrome.footer}</div>
  <script src="/blog/_assets/whoami-login.js"></script>
`;

  let out = html.replace("</head>", `${headLinks}</head>`);
  out = out.replace("<body>", `<body>\n<div class="site-chrome">${chrome.header}</div>\n`);
  out = out.replace("</body>", `${footerBlock}</body>`);
  return out;
}

/** Copy gazette's self-contained static bundle to the served tree and inject. */
function assemblePost(id, chrome) {
  const src = path.join(gazetteBuildDir, id, "static");
  const dest = path.join(distDir, id);

  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });

  const indexPath = path.join(dest, "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  fs.writeFileSync(indexPath, injectChrome(html, chrome));
  console.log(`static-blog: assembled blog-dist/${id}/ (chrome injected)`);
}

function main() {
  if (!fs.existsSync(gazetteBuildDir)) {
    console.error(`No gazette build at ${gazetteBuildDir}. Run 'npm run build:gazette' first.`);
    process.exit(1);
  }

  const chrome = loadChrome();
  buildSharedAssets(chrome);

  const ids = fs
    .readdirSync(gazetteBuildDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "_chrome")
    .map((d) => d.name)
    .filter((id) => fs.existsSync(path.join(gazetteBuildDir, id, "static", "index.html")));

  if (ids.length === 0) {
    console.warn(`No gazette static builds under ${gazetteBuildDir}.`);
  }
  for (const id of ids) assemblePost(id, chrome);

  console.log(`static-blog: chrome stylesheet at blog-dist/_assets/chrome.css (served at /blog/_assets/chrome.css)`);
}

main();
