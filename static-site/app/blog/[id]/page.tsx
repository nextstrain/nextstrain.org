import { redirect } from "next/navigation";
import React from "react";

import { BigSpacer } from "../../../components/spacers";

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
    redirect("/404");
  }

  const html = await markdownToHtml(blogPost.mdstring);

  return (
    <>
      <BigSpacer count={2} />

      <article className="container">
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
