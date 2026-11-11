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
 * The blog index: a standalone page listing every blogpost.
 * Posts are returned newest-first.
 */
export default function BlogIndex(): React.ReactElement {
  const posts = getBlogPosts();

  // Posts arrive newest-first; group them by publication year so each year's
  // set of posts can be introduced by a YYYY heading.
  const postsByYear = new Map<string, typeof posts>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    const yearPosts = postsByYear.get(year);
    if (yearPosts) {
      yearPosts.push(post);
    } else {
      postsByYear.set(year, [post]);
    }
  }

  return (
    <>
      <BigSpacer count={2} />
      <div className="container">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <h1 className={styles.heading}>Nextstrain blog</h1>
            {Array.from(postsByYear.entries()).map(([year, yearPosts]) => (
              <React.Fragment key={year}>
                <h2 className={styles.year}>{year}</h2>
                <ul className={styles.list}>
                  {yearPosts.map((post) => (
                    <li key={post.blogUrlName} className={styles.item}>
                      <div className={styles.title}>
                        <span className={styles.date}>{post.date}</span>{" "}
                        <Link href={`/blog/${post.blogUrlName}`}>
                          {post.title}
                        </Link>
                      </div>
                      {post.author && (
                        <div className={styles.authors}>{post.author}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
