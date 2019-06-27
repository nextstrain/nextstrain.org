const { execFileSync } = require("child_process");
const path = require("path");
// const _ = require("lodash");
const webpackLodashPlugin = require("lodash-webpack-plugin");
const structureEdges = require("./src/util/structureEdges");


/* onCreateNode is called on each node and used to update information.
Here we predominantly use it to set the slug (the URL)
and the order ([chaper, page])
NOTE that for static pages, the slug is set in createPages (below)
NOTE this should probably be moved into createPages */
exports.onCreateNode = ({node, boundActionCreators, getNode}) => {
  /* for markdown files, turn (e.g.)
   * /content/reports/01-flu-vaccine-selection/2015-september into
   * /content/reports/flu-vaccine-selection/2015-september
   *
   * and stash the last commit date for the benefit of templates.
   */
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    const reIntStart = /(\d+)-(.+)/;
    const parsedFilePath = path.parse(fileNode.relativePath);
    const partsOfPath = parsedFilePath.dir.split("/");
    /* step1: get the section, chapter (?) and post data & split out the prefix */
    const section = partsOfPath[0];
    const chapter = {};
    const post = {};
    if (partsOfPath.length === 2) { // CHAPTERS
      const groups = reIntStart.exec(partsOfPath[1]);
      chapter.order = groups[1];
      chapter.name = groups[2];
    }
    // first try date parsing, YYYY-MM-DD-name.md, then XX-name.md
    const dateMatch = parsedFilePath.name.match(/^\d{4}-\d{2}-\d{2}/);
    if (dateMatch !== null) {
      post.order = "-" + dateMatch[0].split('-').join(''); // typed. Must be string.
      post.name = parsedFilePath.name;
    } else {
      const groups = reIntStart.exec(parsedFilePath.name);
      post.order = groups[1];
      post.name = groups[2];
    }
    /* step two: modify the node data */
    if (chapter.name) {
      boundActionCreators.createNodeField({
        node,
        name: "slug",
        value: `/${section}/${chapter.name}/${post.name}`
      });
      // console.log(`${parsedFilePath.dir}/${parsedFilePath.name} (CHAPTERS)-> /${section}/${chapter.name}/${post.name}. Chapter order: ${chapter.order}. Post Order: ${post.order}`)
      boundActionCreators.createNodeField({
        node,
        name: "chapterOrder",
        value: chapter.order
      });
    } else {
      boundActionCreators.createNodeField({
        node,
        name: "slug",
        value: `/${section}/${post.name}`
      });
      // console.log(`${parsedFilePath.dir}/${parsedFilePath.name} -> /${section}/${post.name}. Post Order: ${post.order}`)
      boundActionCreators.createNodeField({
        node,
        name: "chapterOrder",
        value: "00" // this means we don't have chapters! */
      });
    }
    boundActionCreators.createNodeField({
      node,
      name: "postOrder",
      value: post.order
    });

  }
};

/* createPages essentially defines all the URLs and which component gets called to display them */
exports.createPages = ({graphql, boundActionCreators}) => {
  const {createPage, createRedirect} = boundActionCreators;

  /* statically defined pages (i.e. not generated from GraphQL & markdown) */
  /* The context is passed as props to the component as well as into the component's GraphQL query. */
  /* NOTE the splash page is handled elsewhere (it's component is /src/components/Splash/index.jsx) */

  /* dynamically generated pages via allMarkdownRemark plugin processing of markdown files in /content */
  /* we also dynamically create redirects, so that, e.g. /docs/ has somewhere to go! */
  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
        {
          allMarkdownRemark {
            edges {
              node {
                fields {
                  slug
                  chapterOrder
                  postOrder
                }
              }
            }
          }
        }
      `
      ).then((result) => {
        if (result.errors) {
          /* eslint no-console: "off" */
          console.log(result.errors);
          reject(result.errors);
        }
        result.data.allMarkdownRemark.edges.forEach((edge) => {
          // create the actual page
          createPage({
            path: edge.node.fields.slug,
            component: path.resolve("src/templates/displayMarkdown.jsx"),
            context: {
              slug: edge.node.fields.slug
            }
          });
          console.log("created page at", edge.node.fields.slug);
        });

        // SET REDIRECTS (e.g. /about -> /about/overview/overview)
        const sections = result.data.allMarkdownRemark.edges
          .map((edge) => edge.node.fields.slug.split("/")[1])
          .filter((cv, idx, arr) => arr.indexOf(cv)===idx); /* filter to unique values */

        createRedirect({
          fromPath: "/about",
          isPermanent: true,
          redirectInBrowser: true,
          toPath: "/docs/getting-started/introduction"
        });

        sections.forEach((section) => {
          const [hasChapters, data] = structureEdges.parseEdges(result.data.allMarkdownRemark.edges, section);
          /* create the section redirects */
          const sectionGoesTo = hasChapters ?
            data[0].posts[0].path :
            data[0].path;
          createRedirect({
            fromPath: "/" + section,
            isPermanent: true,
            redirectInBrowser: true,
            toPath: sectionGoesTo
          });
          createRedirect({
            fromPath: "/" + section + "/",
            isPermanent: true,
            redirectInBrowser: true,
            toPath: sectionGoesTo
          });
          /* potentially create chapter redirects */
          if (hasChapters) {
            data.forEach((chapterData) => {
              const chapterGoesTo = chapterData.posts[0].path;
              createRedirect({
                fromPath: "/" + section + "/" + chapterData.name,
                isPermanent: true,
                redirectInBrowser: true,
                toPath: chapterGoesTo
              });
              createRedirect({
                fromPath: "/" + section + "/" + chapterData.name + "/",
                isPermanent: true,
                redirectInBrowser: true,
                toPath: chapterGoesTo
              });
            });
          }
        });
      })
    );
  });
};

exports.modifyWebpackConfig = ({config, stage}) => {
  if (stage === "build-javascript") {
    config.plugin("Lodash", webpackLodashPlugin, null);
  }
};
