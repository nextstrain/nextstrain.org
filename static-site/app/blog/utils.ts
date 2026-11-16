import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

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

  /** the post title */
  title: string;
}

/**
 * Returns a chronologically-sorted (newest-first) array of blog posts.
 *
 * Posts are gazette-authored project directories under the repo-root ./blog/
 * directory, each holding an entry Markdown file named after the directory
 * (blog/<slug>/<slug>.md). Their title/date/author are read straight from the
 * gazette source frontmatter.
 *
 * The posts are no longer rendered by Next.js — gazette compiles each to a
 * static page served by Express (see scripts/gazette-blog/). This index page is
 * the only part of the blog still served by Next.js.
 */
export function getBlogPosts(): BlogPost[] {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const gazetteDir = path.join(thisDir, "..", "..", "..", "blog");

  // YYYY-MM-DD strings sort lexicographically; newest-first.
  return readGazettePosts(gazetteDir).sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * Whether a directory does not exist. In production the source directory
 * isn't present (the index is pre-rendered at build time), so a missing
 * directory means "no posts" rather than an error.
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

    const { data: frontmatter } = matter(fs.readFileSync(entryPath, "utf8"));

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
    });
  }

  return posts;
}

/**
 * Normalise a frontmatter date to a YYYY-MM-DD string. gazette frontmatter
 * dates are unquoted YAML dates (parsed to a Date); some are quoted strings.
 */
function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === "string" ? value : "";
}
