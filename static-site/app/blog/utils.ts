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
 * Scans the ./static-site/content/blog directory for .md files and
 * returns a chronologically-sorted array of posts, each with some
 * basic metadata and the raw (unsanitized) markdown contents.
 */
export function getBlogPosts(): BlogPost[] {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const postsDirectory = path.join(__dirname, "..", "..", "content", "blog");

  // if this code is running in production, it won't have access to
  // the postsDirectory, because it doesn't exist there — so check to
  // see if we can `stat()` that path, and if we get an error, if it's
  // a "file not found" error, just return an empty list; otherwise,
  // something else weird is going on, and the best we can do is
  // re-throw the error
  try {
    fs.statSync(postsDirectory);
  }
  catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      err["code"] === "ENOENT"
    ) {
      return [];
    } else {
      throw err;
    }
  }

  const markdownFiles = fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"));

  const blogPosts: BlogPost[] = markdownFiles
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
    .filter((post: false | BlogPost): post is BlogPost => {
      return !!post;
    })
    // YYYY-MM-DD strings sort alphabetically
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return blogPosts;
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
