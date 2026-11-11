#!/usr/bin/env node
// init-blogpost.mjs — scaffold a new gazette blog post.
//
//   npm run blog:init -- YYYY-MM-DD-TITLE
//
// (The `--` tells npm to pass the ID through to this script rather than
// interpreting it as an npm option.)
//
// Given an ID of the form YYYY-MM-DD-TITLE this creates:
//
//   blog/<ID>/<ID>.md      gazette source, with frontmatter derived from the ID
//   blog/<ID>/figures/     (empty) directory for the post's interactive figures
//
// The `date` and `title` frontmatter are parsed from the ID; `authors` is a
// "TKTK" placeholder and `pdf-download` is false. The body is "TKTK". Edit the
// file to write the post. See blog/README.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const blogDir = path.join(repoRoot, "blog");

function fail(msg) {
  console.error(`blog:init: ${msg}`);
  process.exit(1);
}

const id = process.argv[2];
if (!id) {
  fail("missing ID. Usage: npm run blog:init -- YYYY-MM-DD-TITLE");
}
if (process.argv[3]) {
  fail(`unexpected extra argument '${process.argv[3]}'. Usage: npm run blog:init -- YYYY-MM-DD-TITLE`);
}

// YYYY-MM-DD-TITLE: a 10-char ISO date, a hyphen, then a non-empty title slug.
const m = id.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
if (!m) {
  fail(`ID '${id}' is not of the form YYYY-MM-DD-TITLE (e.g. 2026-11-11-my-post)`);
}
const [, year, month, day, titleSlug] = m;
const date = `${year}-${month}-${day}`;

// Reject an impossible calendar date (e.g. 2026-13-40); Date normalises/rolls
// over otherwise, so compare the round-trip against the input.
const parsed = new Date(`${date}T00:00:00Z`);
const roundTrip = Number.isNaN(parsed.getTime())
  ? null
  : parsed.toISOString().slice(0, 10);
if (roundTrip !== date) {
  fail(`ID '${id}' has an invalid date '${date}'`);
}

// Human-readable placeholder title from the slug (hyphens -> spaces). The author
// is expected to edit this into real prose.
const title = titleSlug.replace(/-/g, " ");

const postDir = path.join(blogDir, id);
if (fs.existsSync(postDir)) {
  fail(`blog/${id}/ already exists — refusing to overwrite`);
}

const mdPath = path.join(postDir, `${id}.md`);
const contents = `---
title: "${title}"
date: "${date}"
authors:
  - name: "TKTK"
pdf-download: false
---

TKTK - update this will helpful interoduction to gazette & how to use references, interactive
figures etc.
`;

fs.mkdirSync(path.join(postDir, "figures"), { recursive: true });
fs.writeFileSync(mdPath, contents);


console.log(`blog:init: created blog/${id}/`);
console.log(`  - ${path.relative(repoRoot, mdPath)}  (date "${date}", title "${title}")`);
console.log(`  - blog/${id}/figures/`);
console.log(`Edit the markdown to write the post (see blog/README.md).`);
console.log(`Run 'npx gazette dev ${path.relative(repoRoot, mdPath)}' to render the blogpost (with hotreloading etc)`)
console.log(`See blog/README.md for how to build the entire blog section of the nextstrain.org site`)