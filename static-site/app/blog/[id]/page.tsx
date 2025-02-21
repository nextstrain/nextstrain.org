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

import { getBlogPosts, markdownToHtml } from "../utils";

import styles from "./styles.module.css";

// just to avoid having to repeat this in a couple method sigs...
interface BlogPostParams {
  id: string;
}

// return a list of params that will get handed to this page at build
// time, to statically build out all the blog posts
export function generateStaticParams(): BlogPostParams[] {
  return getBlogPosts().map((post) => {
    return { id: post.blogUrlName };
  });
}

type PopulatedMetadata = Metadata & {
  metadataBase: URL
  openGraph: {
    description: string
    images: { url: string}[]
    siteName: string
    title: string
    type: "website"
    url: URL | string
  }
}

// generate opengraph and other metadata tags
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

export default async function BlogPost({
  params,
}: {
  params: BlogPostParams;
}): Promise<React.ReactElement> {
  const { id } = params;

  // we need this list to build the archive list in the sidebar
  const allBlogPosts = getBlogPosts();

  // and then this is the specific post we're rendering
  const blogPost = allBlogPosts.find((post) => post.blogUrlName === id);

  // if for some reason we didn't find the post, 404 on out
  if (!blogPost) {
    notFound();
  }

  const html = await markdownToHtml({
    mdString: blogPost.mdstring,
    headingAnchorClass: styles.blogPostAnchor,
  });

  return (
    <>
      <BigSpacer count={2} />

      <article className={`container ${styles.blogPost}`}>
        <div className="row">
          <div className="col-lg-8">
            <time className={styles.blogPostDate} dateTime={blogPost.date}>
              {blogPost.date}
            </time>
            <h1 className={styles.blogPostTitle}>{blogPost.title}</h1>
            <h2 className={styles.blogPostAuthor}>{blogPost.author}</h2>
            <div
              className={styles.blogPostBody}
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />
          </div>
          <div className="col-lg-1" />
          <div className={`${styles.blogSidebar} col-lg-3`}>
            <h2>Blog Archives</h2>
            <ul>
              {allBlogPosts.map((p) => (
                <li key={p.blogUrlName}>
                  <a href={p.blogUrlName}>{p.sidebarTitle}</a> ({p.date})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </>
  );
}
