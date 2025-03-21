import { notFound, redirect } from "next/navigation";

import { getBlogPosts } from "./utils";

/**
 * A React Server component that handles redirecting requests for
 * /blog to the most recent blog post
 */
export default function Index(): void {
  const mostRecentPost = getBlogPosts()[0];

  // _technically_ getBlogPosts() could return an empty array and then
  // mostRecentPost would be undefined -- to make the type checker
  // happy, if for some reason mostRecentPost is undefined, we will
  // detect that and throw a not_found error
  mostRecentPost
    ? redirect(`/blog/${mostRecentPost.blogUrlName}`)
    : notFound();
}
