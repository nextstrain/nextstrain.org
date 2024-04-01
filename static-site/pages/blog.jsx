import { useRouter } from "next/router";
import { useEffect} from 'react';
import { getBlogPosts } from "../src/util/blogPosts";


/**
 * Default export is a component which immediately redirects to the latest blog
 * post. Note that we could achieve the same end by adding redirects to
 * `next.config.mjs` but we run into issues (performance & technical) when
 * running getBlogPosts there.
 */
export default function Index({redirectTo}) {
  const router = useRouter();
  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router])
  return null;
}

/**
 * Return the URL for the latest blog post
 * 
 * Note that we cannot return a redirect property here as that's not
 * useable for statically generated sites. See
 * <https://nextjs.org/docs/pages/api-reference/functions/get-static-props#redirect>
 */
export async function getStaticProps() {
  const latestPost = getBlogPosts()[0];
  return {
    props: {redirectTo: `/blog/${latestPost.blogUrlName}`}
  }
}
