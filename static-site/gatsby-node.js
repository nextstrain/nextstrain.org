const path = require("path");
// const _ = require("lodash");
const webpackLodashPlugin = require("lodash-webpack-plugin");
const structureEdges = require("./src/util/structureEdges");
const redirects = require("./redirects.json");
const searchPages = require("./search_pages.json");

/* onCreateNode is called on each node and used to update information.
Here we predominantly use it to set the slug (the URL)
and the order ([chaper, page])
NOTE that for static pages, the slug is set in createPages (below)
NOTE this should probably be moved into createPages */
exports.onCreateNode = ({node, actions, getNode}) => {
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
    post.anchorText = node.frontmatter.anchorText;
    /* step two: modify the node data */
    if (chapter.name) {
      actions.createNodeField({
        node,
        name: "slug",
        value: `/${section}/${chapter.name}/${post.name}`
      });
      // console.log(`${parsedFilePath.dir}/${parsedFilePath.name} (CHAPTERS)-> /${section}/${chapter.name}/${post.name}. Chapter order: ${chapter.order}. Post Order: ${post.order}`)
      actions.createNodeField({
        node,
        name: "chapterOrder",
        value: chapter.order
      });
    } else {
      actions.createNodeField({
        node,
        name: "slug",
        value: `/${section}/${post.name}`
      });
      // console.log(`${parsedFilePath.dir}/${parsedFilePath.name} -> /${section}/${post.name}. Post Order: ${post.order}`)
      actions.createNodeField({
        node,
        name: "chapterOrder",
        value: "00" // this means we don't have chapters! */
      });
    }
    actions.createNodeField({
      node,
      name: "postOrder",
      value: post.order
    });
    actions.createNodeField({
      node,
      name: "anchorText",
      value: post.anchorText
    });

  }
};

/* createPages essentially defines all the URLs and which component gets called to display them */
exports.createPages = ({graphql, actions}) => {
  const {createPage, createRedirect} = actions;

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

        for (const [key, value] of Object.entries(redirects)) {
          createRedirect({
            fromPath: key,
            isPermanent: true,
            redirectInBrowser: true,
            toPath: value
          });
          /* also create redirectos from paths with a trailing slash */
          createRedirect({
            fromPath: `${key}/`,
            isPermanent: true,
            redirectInBrowser: true,
            toPath: value
          });
        }

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

        // Note that many of the pages created here are in src/sections, not src/pages,
        // e.g. src/sections/sars-cov-2-page.jsx. This is because we don't want to render
        // anything at the exact url of nextstrain.org/sars-cov-2-page and
        // Gatsby auto-creates such pages from any jsx file in the src/pages directory.
        // So only pages whose jsx file match the desired url path can be in src/pages.

        // Create individual groups pages
        createPage({
          path: "/groups/:groupName",
          matchPath: "/groups/:groupName/*",
          component: path.resolve("src/sections/individual-group-page.jsx")
        });

        createPage({
          path: "/groups/:groupName/settings",
          matchPath: "/groups/:groupName/settings/*",
          component: path.resolve("src/sections/group-settings-page.jsx")
        });

        // Community splash page
        createPage({
          path: "/community",
          matchPath: "/community/*",
          component: path.resolve("src/sections/community-page.jsx")
        });

        // Community splash page
        createPage({
          path: "/community/:userName/:repoName",
          matchPath: "/community/:userName/:repoName/*",
          component: path.resolve("src/sections/community-repo-page.jsx")
        });

        createPage({
          path: "/community/narratives/:userName/:repoName",
          matchPath: "/community/narratives/:userName/:repoName/*",
          component: path.resolve("src/sections/community-repo-page.jsx")
        });

        // Create page detailing all things SARS-CoV-2
        createPage({
          path: "/sars-cov-2",
          matchPath: "/sars-cov-2/*",
          component: path.resolve("src/sections/sars-cov-2-page.jsx")
        });
        // Create page for SARS-CoV-2 forecasts
        createPage({
          path: "/sars-cov-2/forecasts",
          component: path.resolve("src/sections/sars-cov-2-forecasts-page.jsx")
        });
        // Serve the above page for certain /ncov/* urls, i.e.
        // - `/ncov`
        // - any `/ncov/*` where the * dataset does not exist.
        createPage({
          path: "/ncov",
          matchPath: "/ncov/*",
          component: path.resolve("src/sections/sars-cov-2-page.jsx")
        });

        createPage({
          path: "/staging",
          matchPath: "/staging/*",
          component: path.resolve("src/sections/staging-page.jsx")
        });

        createPage({
          path: "/pathogens",
          component: path.resolve("src/sections/pathogens.jsx")
        });
        createPage({
          path: "/pathogens/inputs",
          component: path.resolve("src/sections/remote-inputs.jsx")
        });

        /* NOTE: we are using "influenza" URLs for dev purposes only. This will be switched to "flu"
        when this functionality is released & publicized. For unknown reasons, if the component is named
        `influenza.jsx` we lose the matchPath functionality. Therefore in a future commit we should simultaneously
        change the path & matchPath to "flu", change the page back to `influenza.jsx`, and update the routing logic of the
        server so that URLs starting with /flu which define valid (core) datasets, and only these, are sent to auspice,
        with the rest falling through to Gatsby to be handled here */
        createPage({
          path: "/influenza",
          matchPath: "/influenza/*",
          component: path.resolve("src/sections/influenza-page.jsx")
        });
        createPage({
          path: "/flu",
          matchPath: "/flu/*",
          component: path.resolve("src/sections/influenza-page.jsx")
        });


        // search pages
        createPage({
          path: `/search`,
          component: path.resolve("src/sections/sequence-search-list.jsx"),
          context: {searchPages}
        });
        searchPages.forEach(({urlName, displayName, jsonUrl}) => {
          console.log(`created page at /search/${urlName}`);
          createPage({
            path: `/search/${urlName}`,
            component: path.resolve("src/sections/sequence-search.jsx"),
            context: {urlName, displayName, jsonUrl}
          });
        });

      })
    );
  });
};

exports.onCreateWebpackConfig = ({stage, actions}) => {
  if (stage === "build-javascript") {
    actions.setWebpackConfig({
      plugins: [webpackLodashPlugin],
    });
  }
};
