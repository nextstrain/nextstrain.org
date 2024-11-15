import { redirect } from "next/navigation";

import { getBlogPosts } from "./utils";

export default function Index(): void {
  const mostRecentPost = getBlogPosts()[0];

  // _technically_ getBlogPosts() could return an empty array and then
  // mostRecentPost would be undefined -- to make the type checker
  // happy, if for some reason mostRecentPost is undefined, we will
  // detect that and redirect to the 404 page
  const redirectTo = mostRecentPost
    ? `/blog/${mostRecentPost.blogUrlName}`
    : `/404`;

  redirect(redirectTo);
}
