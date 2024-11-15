import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

import parseMarkdown from "./parseMarkdown";

export interface BlogPost {
  author: string;
  blogUrlName: string;
  date: string;
  mdstring: string;
  sidebarTitle: string;
  title: string;
}

// Scans the ./static-site/content/blog directory for .md files and
// returns a chronologically-sorted array of posts, each with some
// basic metadata and the raw (unsanitized) markdown contents.
export function getBlogPosts(): BlogPost[] {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const postsDirectory = path.join(__dirname, "..", "..", "content", "blog");

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

export async function markdownToHtml(mdString:string): Promise<string> {
  try {
    return await parseMarkdown(mdString)
  }
  catch(error) {
    console.error(`Error parsing markdown: ${error}`);
    return '<p>There was an error parsing markdown content.</p>';
  }
}
