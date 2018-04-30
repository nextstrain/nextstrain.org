const path = require("path");
const _ = require("lodash");
const webpackLodashPlugin = require("lodash-webpack-plugin");

exports.onCreateNode = ({node, boundActionCreators, getNode}) => {
  const {createNodeField} = boundActionCreators;
  let slug;
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    const parsedFilePath = path.parse(fileNode.relativePath);
    if (
      Object.prototype.hasOwnProperty.call(node, "frontmatter") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "type") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "title")
    ) {
      slug = `/${parsedFilePath.dir}/${_.kebabCase(node.frontmatter.title)}`;
    } else if (parsedFilePath.name !== "index" && parsedFilePath.dir !== "") {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`;
    } else if (parsedFilePath.dir === "") {
      slug = `/${parsedFilePath.name}/`;
    } else {
      slug = `/${parsedFilePath.dir}/`;
    }
    createNodeField({node, name: "slug", value: slug});
  }
};

/* createPages essentially defines all the URLs and which component gets called to display them */
exports.createPages = ({graphql, boundActionCreators}) => {
  const {createPage} = boundActionCreators;

  /* statically defined pages (i.e. not generated from GraphQL & markdown) */
  /* The context is passed as props to the component as well as into the component's GraphQL query. */
  /* NOTE the splash page is handled elsewhere (it's component is /src/components/Splash/index.jsx) */
  createPage({path: `/about`, component: path.resolve("src/pages/about/about.jsx")})
  createPage({path: `/flu`,   component: path.resolve("src/pages/flu/flu.jsx")})

  /* dynamically generated pages via allMarkdownRemark plugin processing of markdown files in /content */
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
                }
              }
            }
          }
        }
      `
      ).then(result => {
        if (result.errors) {
          /* eslint no-console: "off"*/
          console.log(result.errors);
          reject(result.errors);
        }
        result.data.allMarkdownRemark.edges.forEach(edge => {
          createPage({
            path: edge.node.fields.slug,
            component: path.resolve("src/templates/generic.jsx"),
            context: {
              slug: edge.node.fields.slug
            }
          })
        })
      })
    );
  });
};

exports.modifyWebpackConfig = ({config, stage}) => {
  if (stage === "build-javascript") {
    config.plugin("Lodash", webpackLodashPlugin, null);
  }
};
