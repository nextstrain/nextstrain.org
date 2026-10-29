import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

import parseMarkdown from "./parseMarkdown";

export interface BlogPost {
  /** author(s) name(s) */
  author: string;

  /**
   * the "slug" for this post, i.e., the string after `/blog` in the
   * post's URL
   */
  blogUrlName: string;

  /** publication date of the post */
  date: string;

  /** the Markdown-formatted content of the post */
  mdstring: string;

  /** the string to use in the blog sidebar for this post */
  sidebarTitle: string;

  /** the post title */
  title: string;
}

/**
 * Returns a chronologically-sorted (newest-first) array of blog posts, drawn
 * from two sources:
 *
 *  - Nextstrain markdown posts in ./static-site/content/blog/*.md
 *  - gazette-authored posts: project directories under the repo-root ./blog/
 *    directory, each holding an entry Markdown file named after the directory
 *    (blog/<slug>/<slug>.md). Their title/date/author are read straight from
 *    the gazette source frontmatter, so a gazette post needs no stub markdown
 *    file to appear in the blog.
 */
export function getBlogPosts(): BlogPost[] {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));

  const markdownDir = path.join(thisDir, "..", "..", "content", "blog");
  const gazetteDir = path.join(thisDir, "..", "..", "..", "blog");

  const posts = [
    ...readMarkdownPosts(markdownDir),
    ...readGazettePosts(gazetteDir),
  ];

  // Dedupe by slug (keep the first occurrence — markdown posts take precedence)
  // then sort newest-first; YYYY-MM-DD strings sort lexicographically.
  const bySlug = new Map<string, BlogPost>();
  for (const post of posts) {
    if (!bySlug.has(post.blogUrlName)) bySlug.set(post.blogUrlName, post);
  }
  return Array.from(bySlug.values()).sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * Whether a directory does not exist. In production the source directories
 * aren't present (pages are pre-rendered at build time), so a missing
 * directory means "no posts from here" rather than an error.
 */
function directoryMissing(dir: string): boolean {
  try {
    fs.statSync(dir);
    return false;
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && err["code"] === "ENOENT") {
      return true;
    }
    throw err;
  }
}

/** Read the Nextstrain markdown posts (content/blog/*.md). */
function readMarkdownPosts(postsDirectory: string): BlogPost[] {
  if (directoryMissing(postsDirectory)) return [];

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName): BlogPost | false => {
      const { data: frontmatter, content: mdstring } = matter(
        fs.readFileSync(path.join(postsDirectory, fileName), "utf8"),
      );

      // Our blog posts have frontmatter which includes author, date
      // (YYYY-MM-DD format), post title, and an optional sidebar title.
      // If the sidebar title isn't provided, the post title will be
      // used for the sidebar title.
      const { author, date, title } = frontmatter;

      if (!author || !date || !title) {
        // console warning printed server-side
        console.warn(
          `Blog post ${fileName} skipped due to empty/incomplete frontmatter`,
        );
        // we will filter these `false` values out momentarily
        return false;
      } else {
        const blogUrlName = fileName.replace(/\.md$/, "");
        const sidebarTitle: string = frontmatter.sidebarTitle || title;
        return { author, date, title, blogUrlName, sidebarTitle, mdstring };
      }
    })
    // type guard to filter out false entries generated because of bad frontmatter
    .filter((post: false | BlogPost): post is BlogPost => !!post);
}

/**
 * Read gazette-authored posts from the repo-root blog/ directory. Each post is
 * a project directory whose entry Markdown file is named after the directory
 * (blog/<slug>/<slug>.md); that file's frontmatter supplies the post metadata.
 * The directory name is the post slug (and the gazette bundle's base path).
 */
function readGazettePosts(blogDir: string): BlogPost[] {
  if (directoryMissing(blogDir)) return [];

  const posts: BlogPost[] = [];

  for (const dirent of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;

    const slug = dirent.name;
    const entryPath = path.join(blogDir, slug, `${slug}.md`);
    if (!fs.existsSync(entryPath)) continue;

    const { data: frontmatter, content: mdstring } = matter(
      fs.readFileSync(entryPath, "utf8"),
    );

    const title: string = frontmatter.title;
    const date = normalizeDate(frontmatter.date);

    if (!title || !date) {
      console.warn(
        `Gazette blog post ${slug} skipped due to missing title/date frontmatter`,
      );
      continue;
    }

    // gazette frontmatter uses an `authors` list of { name, ... }; fall back to
    // a plain `author` string if present.
    const author = Array.isArray(frontmatter.authors)
      ? frontmatter.authors
          .map((a: { name?: string }) => a && a.name)
          .filter(Boolean)
          .join(", ")
      : frontmatter.author || "";

    posts.push({
      author,
      blogUrlName: slug,
      date,
      title,
      sidebarTitle: frontmatter.sidebarTitle || title,
      mdstring,
    });
  }

  return posts;
}

/**
 * Normalise a frontmatter date to a YYYY-MM-DD string. gazette frontmatter
 * dates are unquoted YAML dates (parsed to a Date); Nextstrain markdown posts
 * quote them as strings.
 */
function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" ? value : "";
}

/**
 * A function to transform a Markdown-formatted string into HTML.
 */
export async function markdownToHtml({
  mdString,
  inline,
  addHeadingAnchors,
  headingAnchorClass,
}: {
  /** the Markdown-formatted string to transform */
  mdString: string;

  /** inline or block? **/
  inline?: boolean;

  /** if to add anchors to headings or not */
  addHeadingAnchors?: boolean;

  /** the name to use for the CSS class on heading anchors */
  headingAnchorClass?: string;
}): Promise<string> {
  try {
    return await parseMarkdown({
      mdString,
      inline: !!inline,
      addHeadingAnchors: addHeadingAnchors ?? !inline,
      headingAnchorClass,
    })
  }
  catch(error) {
    console.error(`Error parsing markdown: ${error}`);
    return '<p>There was an error parsing markdown content.</p>';
  }
}
