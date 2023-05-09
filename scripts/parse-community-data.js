/**
 * A very bare-bones script to extract the maintainer from
 * community datasets (author from narratives).
 *
 * Example of how to run:
 * 1. node scripts/parse-community-data.js | pbcopy
 * 2. paste results into ./static-site/content/community-datasets.yaml
 */
import fs from 'fs';

import yaml from 'js-yaml';
import yamlFrontMatter from 'yaml-front-matter';
import fetch from 'node-fetch';

main();

async function main() {
  const catalog = yaml.load(fs.readFileSync("./static-site/content/community-datasets.yaml", 'utf8'));
  for (const [idx, entry] of catalog.data.entries()) {
    process.stderr.write(`Progress: ${idx+1}/${catalog.data.length}. URL: ...${entry.url.slice(-25)}\n`);
    let isNarrative, contents;
    try {
      [isNarrative, contents] = await fetchData(entry.url);
    } catch (e) {
      process.stderr.write("\tWARNING! Error fetching data\n");
      continue;
    }
    const info = isNarrative ? extractNarrativeInfo(contents) : extractDatasetInfo(contents);
    catalog.data[idx] = {
      ...entry,
      ...info
    };
  }
  console.log(yaml.dump(catalog, {indent: 2, lineWidth: -1}));
}

function extractNarrativeInfo(contents) {
  try {
    const frontmatter = yamlFrontMatter.loadFront(contents);
    const maintainers = frontmatter?.authors?.join(", ");
    const date = frontmatter?.date;
    const title = frontmatter?.title;
    return {
      title,
      maintainers,
      date
    };
  } catch (e) {
    process.stderr.write("\tWARNING! Error parsing narrative contents\n");
    return {};
  }
}

function extractDatasetInfo(contents) {
  const maintainers = contents?.meta?.maintainers?.map((m) => m.name).join(", ");
  const date = contents?.meta?.updated;
  const title = contents?.meta?.title;
  return {
    maintainers,
    date,
    title
  };
}

/**
 * Fetch from the charon endpoint so we avoid having to map a URL to a particular asset (file) in the repo
 */
async function fetchData(providedUrl) {
  const url = new URL(providedUrl, "https://nextstrain.org");
  const communityUrlPattern = new RegExp("^/community(?<narrative>/narratives)?/(?<org>[^/]+)/(?<repo>[^/]+)(?<pathSuffix>/.*)?");
  const urlMatches = url.pathname.match(communityUrlPattern);
  const isNarrative = !!urlMatches.groups.narrative;
  const charonUrl = `https://nextstrain.org/charon/get${isNarrative?'Narrative':'Dataset'}?prefix=${url.pathname}${isNarrative?'&type=md':''}`;
  const f = await fetch(charonUrl).then((res) => isNarrative ? res.text() : res.json());
  return [isNarrative, f];
}
