import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import { BigSpacer } from "../../../components/spacers";
import {
  siteLogo,
  siteTitle,
  siteTitleAlt,
  siteUrl,
} from "../../../data/BaseConfig";

import type { BlogPost } from "../utils";
import { getBlogPosts, markdownToHtml } from "../utils";

import styles from "./styles.module.css";

// just to avoid having to repeat this in a couple method sigs...
interface BlogPostParams {
  /** a string representing the base name of the post */
  id: string;
}

/**
 * return a list of params that will get handed to this page at build
 * time, to statically build out all the blog posts
 */
export function generateStaticParams(): BlogPostParams[] {
  return getBlogPosts().map((post) => {
    return { id: post.blogUrlName };
  });
}

type PopulatedMetadata = Metadata & {
  /** the base URL to use for metadata attributes */
  metadataBase: URL

  /** data to generate OpenGraph headers in the <head> of the page */
  openGraph: {
    /** a brief description of the post */
    description: string

    /** an array of image URLs associated with the post */
    images: { url: string}[]

    /** the name of our site */
    siteName: string

    /** the title of the blog post */
    title: string

    /** we have a website! */
    type: "website"

    /** the URL for the post */
    url: URL | string
  }
}

/** generate opengraph and other metadata tags */
export async function generateMetadata({
  params,
}: {
  params: BlogPostParams;
}): Promise<Metadata> {
  const { id } = params;

  // set up some defaults that are independent of the specific blog post
  const baseUrl = new URL(siteUrl);
  const metadata: PopulatedMetadata = {
    metadataBase: baseUrl,
    openGraph: {
      description: siteTitleAlt,
      images: [
        {
          url: `${siteUrl}${siteLogo}`,
        },
      ],
      siteName: siteTitle,
      title: siteTitle,
      type: "website",
      url: baseUrl,
    },
  };

  // this is the specific post we're rendering
  const blogPost = getBlogPosts().find((post) => post.blogUrlName === id);

  if (blogPost) {
    const description = `Nextstrain blog post from ${blogPost.date}; author(s): ${blogPost.author}`;

    metadata.title = blogPost.title;
    metadata.description = description;
    metadata.openGraph.description = description;
    metadata.openGraph.title = `${siteTitle}: ${blogPost.title}`;
    metadata.openGraph.url = `/blog/${blogPost.blogUrlName}`;
  }

  return metadata;
}

/**
 * A React Server Component for rendering a single blog post
 */
export default async function BlogPost({
  params,
}: {
  params: BlogPostParams;
}): Promise<React.ReactElement> {
  const { id } = params;

  // we need this list to build the archive list in the sidebar
  const allBlogPosts: Array<BlogPost & {sidebarTitleHtml?: {__html: string}}> = getBlogPosts();

  // and then this is the specific post we're rendering
  const blogPost = allBlogPosts.find((post) => post.blogUrlName === id);

  // if for some reason we didn't find the post, 404 on out
  if (!blogPost) {
    notFound();
  }

  const mdToHtml = async (md: string, {inline = false}: {inline?: boolean} = {}) => ({
    __html: await markdownToHtml({
      mdString: md,
      inline,
      ...(!inline
        ? {addHeadingAnchors: true, headingAnchorClass: styles.blogPostAnchor}
        : {}),
    })
  });

  const bodyHtml = await mdToHtml(blogPost.mdstring);
  const titleHtml = await mdToHtml(blogPost.title, {inline: true});

  for (const p of allBlogPosts) {
    p.sidebarTitleHtml = await mdToHtml(p.sidebarTitle, {inline: true});
  }

  return (
    <>
      <BigSpacer count={2} />

      <article className={`container ${styles.blogPost}`}>
        <div className="row">
          <div className="col-lg-8">
            <time className={styles.blogPostDate} dateTime={blogPost.date}>
              {blogPost.date}
            </time>
            <h1
              className={styles.blogPostTitle}
              dangerouslySetInnerHTML={titleHtml}
            />
            <h2 className={styles.blogPostAuthor}>{blogPost.author}</h2>
            <div
              className={styles.blogPostBody}
              dangerouslySetInnerHTML={bodyHtml}
            />
          </div>
          <div className="col-lg-1" />
          <div className={`${styles.blogSidebar} col-lg-3`}>
            <h2>Blog Archives</h2>
            <ul>
              {allBlogPosts.map((p) => (
                <li key={p.blogUrlName}>
                  <a
                    href={p.blogUrlName}
                    dangerouslySetInnerHTML={p.sidebarTitleHtml}
                  /> ({p.date})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </>
  );
}
