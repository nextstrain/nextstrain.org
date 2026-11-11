import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { Feed } from 'feed';

import { parseMarkdown } from "./parseMarkdown.js";
import { blogDescription, blogFeeds, blogFeedUrls, blogUrl, siteLogo, siteTitle, siteUrl  } from '../../data/BaseConfig.js';

const NUMBER_OF_POSTS_IN_FEED = 10;

// The installed gazette binary (a project dependency; see package.json). Invoke
// it by explicit path rather than a bare "gazette" on $PATH, so feed generation
// is deterministic and doesn't depend on a globally-linked copy being present.
const GAZETTE_BIN = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../node_modules/.bin/gazette"
);

/**
 * Writes RSS2, Atom, and JSON feeds into the top-level `blog-dist/` directory
 * (served by Express at /blog/<feed>, alongside the built gazette posts; see
 * src/routing/staticBlog.js and scripts/gazette-blog/).
 *
 * Posts are the gazette-authored projects under the repo-root `blog/`
 * directory (blog/<slug>/<slug>.md). Each feed entry carries the post's
 * abstract (extracted by the `gazette abstract` CLI) as a short excerpt plus a
 * link to the full post — we deliberately do NOT embed the full post body,
 * because gazette source uses constructs (`:::figure` directives, `[@fig:id]`
 * cross-references, ```yaml gazette blocks) that don't render as plain Markdown.
 */
export async function generateBlogFeeds() {
  const feed = new Feed({
    title: `${siteTitle} Blog`,
    description: blogDescription,
    id: blogUrl,
    link: blogUrl,
    image: `${siteUrl}${siteLogo}`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: "Copyright Trevor Bedford and Richard Neher.",
    updated: new Date(),
    feedLinks: blogFeedUrls,
    author: {
      name: "The Nextstrain Team",
      email: "hello@nextstrain.org",
      link: siteUrl,
    },
  });

  const posts = getGazetteBlogPosts().slice(0, NUMBER_OF_POSTS_IN_FEED);

  for (const post of posts) {
    try {
      const url = `${blogUrl}/${post.slug}`;
      const abstractHtml = renderAbstract(getAbstract(post.entryPath));
      const content =
        abstractHtml +
        `<p><a href="${url}">Read the full post on nextstrain.org →</a></p>`;

      feed.addItem({
        author: post.authors.map((name) => ({ name })),
        content,
        description: toPlainText(abstractHtml),
        date: post.date,
        published: post.date,
        id: url,
        link: url,
        title: post.title,
      });
    } catch (error) {
      console.error(`Skipping post entitled "${post.title}" due to error:\n${error}`);
    }
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const feedDir = path.join(__dirname, "..", "..", "..", "blog-dist");
  fs.mkdirSync(feedDir, { recursive: true });
  const feeds = [
    {
      file: path.join(feedDir, blogFeeds.atom),
      data: feed.atom1,
    },
    {
      file: path.join(feedDir, blogFeeds.json),
      data: feed.json1,
    },
    {
      file: path.join(feedDir, blogFeeds.rss2),
      data: feed.rss2,
    },
  ];

  for (const feed of feeds) {
    fs.writeFileSync(feed.file, feed.data());
  }
}

/**
 * Crawl the repo-root `blog/` directory for gazette posts and return them
 * newest-first, each as { slug, entryPath, title, date (Date), authors
 * (string[]) }. The abstract is fetched lazily (see getAbstract) only for the
 * posts that make it into the feed.
 */
function getGazetteBlogPosts() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const blogDir = path.join(__dirname, "..", "..", "..", "blog");

  if (!fs.existsSync(blogDir)) return [];

  const posts = [];
  for (const dirent of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;

    const slug = dirent.name;
    const entryPath = path.join(blogDir, slug, `${slug}.md`);
    if (!fs.existsSync(entryPath)) continue;

    const { data: frontmatter } = matter(fs.readFileSync(entryPath, "utf8"));

    const title = frontmatter.title;
    const date = normalizeDate(frontmatter.date);
    if (!title || !date) {
      console.warn(`Gazette blog post ${slug} skipped due to missing title/date frontmatter`);
      continue;
    }

    posts.push({
      slug,
      entryPath,
      title,
      date,
      authors: getAuthors(frontmatter),
    });
  }

  // YYYY-MM-DD ordering; newest first.
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * The post's abstract as Markdown, via `gazette abstract <file>`. Returns "" if
 * the CLI is unavailable or fails, so a post still appears in the feed (with
 * just its title + link) rather than being dropped.
 */
function getAbstract(entryPath) {
  try {
    return execFileSync(GAZETTE_BIN, ["abstract", entryPath], {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    console.warn(`Could not extract abstract for ${entryPath}: ${error.message}`);
    return "";
  }
}

/**
 * All author names from the frontmatter `authors` list (gazette style:
 * `authors: [{name: ...}]`), falling back to a comma-separated `author` string.
 */
function getAuthors(frontmatter) {
  if (Array.isArray(frontmatter.authors)) {
    return frontmatter.authors.map((a) => a && a.name).filter(Boolean);
  }
  if (frontmatter.author) {
    return String(frontmatter.author).split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** gazette frontmatter dates may be YAML Dates (unquoted) or quoted strings. */
function normalizeDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return undefined;
}

/** Render abstract Markdown to sanitized HTML, with root-relative URLs made absolute. */
function renderAbstract(md) {
  if (!md) return "";
  const html = parseMarkdown(md);
  // Feed readers need absolute URLs; site links in posts are root-relative.
  return html
    .replace(/href="\/(?!\/)/g, `href="${siteUrl}/`)
    .replace(/src="\/(?!\/)/g, `src="${siteUrl}/`);
}

/** Crude tag strip for the plain-text <description>. */
function toPlainText(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
