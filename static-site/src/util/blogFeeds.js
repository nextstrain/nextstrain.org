import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Feed } from 'feed';

import { getBlogPosts} from "./blogPosts.js";
import { parseMarkdown } from "./parseMarkdown.js";
import { blogDescription, blogFeeds, blogFeedUrls, blogUrl, siteLogo, siteTitle, siteUrl  } from '../../data/BaseConfig.js';

const NUMBER_OF_POSTS_IN_FEED = 10;

/**
 * Writes RSS2, Atom, and JSON feeds into the `public/blog` directory.
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

  const posts = getBlogPosts().slice(0, NUMBER_OF_POSTS_IN_FEED);

  for (const post of posts) {
    if (post) { // getBlogPosts() _might_ return `false` list members
      try {
        const content = parseMarkdown(post.mdstring);
        const url = `${blogUrl}/${post.blogUrlName}`;

        feed.addItem({
          author: [ { name: post.author } ],
          content: content,
          date: new Date(post.date),
          id: url,
          link: url,
          title: post.title,
        });
      } catch (error) {
        console.error(`Skipping post entitled "${post.title}" due to Markdown parsing error:\n${error}`);
      }
    }
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const feedDir = `${__dirname}/../../public/blog`;
  const feeds = [
    {
      file: `${feedDir}/${blogFeeds.atom}`,
      data: feed.atom1,
    },
    {
      file: `${feedDir}/${blogFeeds.json}`,
      data: feed.json1,
    },
    {
      file: `${feedDir}/${blogFeeds.rss2}`,
      data: feed.rss2,
    },
  ];

  for (const feed of feeds) {
    fs.writeFileSync(feed.file, feed.data());
  }
}
