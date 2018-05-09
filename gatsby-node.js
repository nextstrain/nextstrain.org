const path = require("path");
// const _ = require("lodash");
const webpackLodashPlugin = require("lodash-webpack-plugin");

/* onCreateNode is called on each node and used to update information.
Here we predominantly use it to set the slug (the URL)
and the order ([chaper, page])
NOTE that for static pages, the slug is set in createPages (below)
NOTE this should probably be moved into createPages */
exports.onCreateNode = ({node, boundActionCreators, getNode}) => {
  /* for markdown files, turn (e.g.)
   * /content/reports/01-flu-vaccine-selection/2015-september into
   * /content/reports/flu-vaccine-selection/2015-september
   */
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    const parsedFilePath = path.parse(fileNode.relativePath);
    const [section, chapterWithPrefix] = parsedFilePath.dir.split("/");
    const re = /(\d+)-(.+)/;
    const chapterGroups = re.exec(chapterWithPrefix);
    const nameGroups = re.exec(parsedFilePath.name);
    try {
      boundActionCreators.createNodeField({
        node,
        name: "slug",
        value: `/${section}/${chapterGroups[2]}/${nameGroups[2]}`
      });
      boundActionCreators.createNodeField({
        node,
        name: "chapterOrder",
        value: chapterGroups[1]
      });
      boundActionCreators.createNodeField({
        node,
        name: "postOrder",
        value: nameGroups[1]
      });
    } catch (err) {
      console.log("ERROR parsing the paths of ", parsedFilePath);
    }

  }
};

/* createPages essentially defines all the URLs and which component gets called to display them */
exports.createPages = ({graphql, boundActionCreators}) => {
  const {createPage, createRedirect} = boundActionCreators;

  /* statically defined pages (i.e. not generated from GraphQL & markdown) */
  /* The context is passed as props to the component as well as into the component's GraphQL query. */
  /* NOTE the splash page is handled elsewhere (it's component is /src/components/Splash/index.jsx) */
  createPage({path: `/about`, component: path.resolve("src/components/about/about.jsx")});
  createPage({path: `/flu`, component: path.resolve("src/components/flu/flu.jsx")});

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
          // if it's the first, then create redirects from the chapter and the section levels.
          // Note, you need a seperate redirect for the trailing slash (!)
          if (parseInt(edge.node.fields.postOrder, 10) === 1) {
            // CHAPTER eg docs/builds or docs/builds/
            const chapterPathname = edge.node.fields.slug.split('/').slice(0, 3);
            createRedirect({
              fromPath: chapterPathname.join("/"),
              isPermanent: true,
              redirectInBrowser: true,
              toPath: edge.node.fields.slug
            });
            createRedirect({
              fromPath: chapterPathname.join("/") + "/",
              isPermanent: true,
              redirectInBrowser: true,
              toPath: edge.node.fields.slug
            });

            if (parseInt(edge.node.fields.chapterOrder, 10) === 1) {
              // SECTION e.g. /docs or /docs/
              const sectionPathname = edge.node.fields.slug.split('/').slice(0, 2);
              createRedirect({
                fromPath: sectionPathname.join("/"),
                isPermanent: true,
                redirectInBrowser: true,
                toPath: edge.node.fields.slug
              });
              createRedirect({
                fromPath: sectionPathname.join("/") + "/",
                isPermanent: true,
                redirectInBrowser: true,
                toPath: edge.node.fields.slug
              });
            }
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
