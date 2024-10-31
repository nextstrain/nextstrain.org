// DEPRECATED

// `getBlogPosts` in this file has been moved to
// `/static-site/app/blog/utils.ts`; this version is still here
// because it is used by `/static-site/src/util/blogFeeds.js`, which
// still needs to be ported over.

// DO NOT ADD NEW USES OF THE METHOD IN THIS FILE

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

/**
 * Scans the ./static-site/content/blog directory for .md files
 * and returns a chronologically sorted array of posts, each with
 * some basic metadata and the raw (unsanitized) markdown contents.
 */
export function getBlogPosts() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const postsDirectory = path.join(__dirname, "..", "..", "content", "blog")
  const markdownFiles = fs.readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"));

  const blogPosts = markdownFiles.map((fileName) => {
    const {data: frontmatter, content: mdstring, isEmpty} = matter(
      fs.readFileSync(path.join(postsDirectory, fileName), 'utf8')
    );
    // Our blog posts have frontmatter which includes author, date
    // (YYYY-MM-DD format), post title, and an optional sidebar title.
    // If the sidebar title isn't provided, the post title will be
    // used for the sidebar title.
    const {author, date, title} = frontmatter;
    if (isEmpty || !author || !date || !title) {
      // console warning printed server-side
      console.warn(`Blog post ${fileName} skipped due to empty/incomplete frontmatter`)
      return false;
    }
    const blogUrlName = fileName.replace(/\.md$/, '');
    const sidebarTitle = frontmatter.sidebarTitle || title;
    return {author, date, title, blogUrlName, sidebarTitle, mdstring};
  })
    .filter((data) => !!data)
    .sort((a, b) => a.date > b.date ? -1 : 1); // YYYY-MM-DD strings sort alphabetically

  return blogPosts;
}
