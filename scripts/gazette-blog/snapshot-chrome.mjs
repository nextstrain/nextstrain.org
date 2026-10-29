#!/usr/bin/env node
// snapshot-chrome.mjs — generate the static blog's header/footer from the REAL
// <Nav/>/<Footer/> components, once, at build time (approach "A").
//
// The Next.js route app/chrome-snapshot/page.tsx renders only <Nav/> and
// <Footer/> (each wrapped in a unique custom element). This script fetches that
// page over HTTP from a running Next server, extracts the two fragments and the
// CSS the page links (/_next/static/css/…, which carries the real global CSS
// AND the components' CSS-module rules with matching hashed class names), scopes
// all of it under `.site-chrome`, and writes the snapshot that build-static-blog
// injects into each gazette page. Because the markup and CSS both come straight
// from Next, the chrome cannot drift from the rest of the site.
//
//   Usage:  node scripts/gazette-blog/snapshot-chrome.mjs [baseUrl]
//           baseUrl defaults to $GAZETTE_CHROME_URL or http://localhost:5000
//
// Requires a running Next server (dev `npm run dev`, or the built prod server).
// Writes .gazette-build/_chrome/{header.html,footer.html,chrome.css}.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scopeCss } from "./scope-css.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const outDir = path.join(repoRoot, ".gazette-build", "_chrome");

const baseUrl = (
  process.argv[2] ||
  process.env.GAZETTE_CHROME_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const SNAPSHOT_PATH = "/chrome-snapshot";

/** Extract the inner HTML of a <gazette-chrome-NAME>…</…> custom element. */
function extractFragment(html, name) {
  const re = new RegExp(`<gazette-chrome-${name}[^>]*>([\\s\\S]*?)</gazette-chrome-${name}>`);
  const m = html.match(re);
  if (!m) throw new Error(`could not find <gazette-chrome-${name}> in ${SNAPSHOT_PATH}`);
  return m[1].trim();
}

/** All /_next/static/css/… stylesheet hrefs the page links, in document order. */
function cssHrefs(html) {
  const hrefs = [];
  const re = /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    if (/\/_next\/static\/css\//.test(m[1])) hrefs.push(m[1]);
  }
  return hrefs;
}

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

async function main() {
  const pageUrl = `${baseUrl}${SNAPSHOT_PATH}`;
  let html;
  try {
    html = await get(pageUrl);
  } catch (err) {
    console.error(`snapshot-chrome: could not fetch ${pageUrl}`);
    console.error(`  Is a Next server running? Start one (e.g. 'npm run dev') or`);
    console.error(`  pass the base URL: node scripts/gazette-blog/snapshot-chrome.mjs <url>`);
    console.error(`  (${err.message})`);
    process.exit(1);
  }

  const headerHtml = extractFragment(html, "header");
  const footerHtml = extractFragment(html, "footer");

  const hrefs = cssHrefs(html);
  if (hrefs.length === 0) throw new Error(`no /_next/static/css/ stylesheets linked on ${SNAPSHOT_PATH}`);
  const cssParts = [];
  for (const href of hrefs) {
    const css = await get(`${baseUrl}${href}`);
    cssParts.push(`/* ===== ${href.split("?")[0]} ===== */\n${css}`);
  }
  // Scope the whole lot (Next globals + the components' module CSS) under
  // `.site-chrome` and convert rem->px (see scope-css.mjs).
  const scoped = await scopeCss(cssParts.join("\n\n"), { from: "chrome-snapshot" });

  // next/font sets the --lato variable on the <body>'s hashed "variable" class
  // (.__variable_xxxx). Our injected chrome wrappers don't carry that class, so
  // --lato would be undefined and the chrome would fall back to Helvetica.
  // Re-home that rule onto `.site-chrome` itself so the chrome uses the site's
  // own self-hosted Lato — whose @font-face rules are already in this CSS — with
  // no external font dependency.
  const chromeCss = scoped.replace(/\.site-chrome \.__variable_[A-Za-z0-9]+/g, ".site-chrome");
  const rehomed = chromeCss !== scoped;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "header.html"), headerHtml + "\n");
  fs.writeFileSync(path.join(outDir, "footer.html"), footerHtml + "\n");
  fs.writeFileSync(path.join(outDir, "chrome.css"), chromeCss);

  console.log(`snapshot-chrome: fetched ${pageUrl}`);
  console.log(`snapshot-chrome: ${hrefs.length} stylesheet(s) -> .gazette-build/_chrome/chrome.css`);
  console.log(`snapshot-chrome: --lato re-homed onto .site-chrome: ${rehomed ? "yes" : "NO (next/font variable class not found — check font output)"}`);
  console.log(`snapshot-chrome: header.html, footer.html written`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
