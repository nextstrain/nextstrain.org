import dynamic from 'next/dynamic'
import { getBlogPosts } from "../../src/util/blogPosts";
const DisplayMarkdown = dynamic(() => import("../../src/templates/displayMarkdown"), {ssr: false})


/**
 * Generate a list of the appropriate blog URLs we want Next.JS to generate
 * static pages for.
 *
 * Note that the docs
 * <https://nextjs.org/docs/pages/api-reference/functions/get-static-paths>
 * indicate you can export arbitrary data from here and consume it in
 * getStaticProps but the only field you can pass is the router param ("id" in
 * this case). See <https://github.com/vercel/next.js/discussions/11272>
 */
export const getStaticPaths = (async () => {
  const posts = getBlogPosts();
  const paths = posts.map((post) => ({params: {
    id: post.blogUrlName, /* matches the `id` router param defined via `[id].jsx` */
  }}));
  return {
    paths,
    fallback: false // any paths not defined will result in a 404 page
  }
})

/**
 * For a given id (matching the route /blog/id via the dynamic routing filename `blog/[id].jsx`)
 * return the params to be parsed to the rendering component.
 *
 * Note: The context.params.id is set to one of the entries in the array returned from
 * `getStaticPaths`. See <https://nextjs.org/docs/pages/api-reference/functions/get-static-props>
 */
export const getStaticProps = (async (context) => {
  const posts = getBlogPosts();
  const thisPost = posts.find((post) => post.blogUrlName===context.params.id);
  const sidebarData = posts.map((post) => {
    return {date: post.date, blogUrlName: post.blogUrlName, sidebarTitle: post.sidebarTitle, selected: post===thisPost};
  })
  return {
    props: {...thisPost, sidebarData}
  };
})

export default function Index(props) {
  return (<DisplayMarkdown {...props}/>)
}
