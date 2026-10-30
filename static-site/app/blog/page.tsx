import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import { BigSpacer } from "../../components/spacers";

import { getBlogPosts } from "./utils";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
};

/**
 * The blog index: a standalone page listing every post — markdown- and
 * gazette-authored alike, since both surface through getBlogPosts() — as a
 * link to /blog/<slug> labelled with the post's `title` frontmatter. Posts are
 * returned newest-first.
 */
export default function BlogIndex(): React.ReactElement {
  const posts = getBlogPosts();

  return (
    <>
      <BigSpacer count={2} />
      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <h1 className={styles.heading}>Nextstrain blog</h1>
            <ul className={styles.list}>
              {posts.map((post) => (
                <li key={post.blogUrlName} className={styles.item}>
                  <Link href={`/blog/${post.blogUrlName}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
