import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import lodash from "lodash";

const { startCase } = lodash;

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
    // Our blog posts have frontmatter which includes author, date (YYYY-MM-DD format) and title
    const {author, date, title} = frontmatter;
    if (isEmpty || !author || !date || !title) {
      // console warning printed server-side
      console.warn(`Blog post ${fileName} skipped due to empty/incomplete frontmatter`)
      return false;
    }
    const blogUrlName = fileName.replace(/\.md$/, '');
    const sidebarName = formatFileName(blogUrlName);
    return {author, date, title, blogUrlName, sidebarName, mdstring};
  })
    .filter((data) => !!data)
    .sort((a, b) => a.date > b.date ? -1 : 1); // YYYY-MM-DD strings sort alphabetically

  return blogPosts;
}

/**
 * strip out the YYYY-MM-DD- leading string from blog-post filenames and return
 * the rest of the filename converted to start case (first letter of each word
 * capitalized). The returned name is indented to be used for sidebar display.
 */
function formatFileName (name) {
  const parts = /^\d{4}-\d{2}-\d{2}-(.*)/.exec(name);
  if (parts) {
    return startCase(parts[1]);
  }
  return startCase(name);
}
