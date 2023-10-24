const config = require("./data/SiteConfig");

module.exports = {
  pathPrefix: config.pathPrefix,
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-styled-components",
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `lato: 100,200,300,400,500,600,700`,
          `fira mono: 400`
        ]
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/content/`
      }
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 800
            }
          },
          {
            resolve: "gatsby-remark-responsive-iframe"
          },
          "gatsby-remark-prismjs",
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-autolink-headers",
          "gatsby-remark-smartypants"
        ]
      }
    },
    {
      resolve: "gatsby-plugin-nprogress",
      options: {
        color: config.progressBarColor
      }
    },
    {
      resolve: "gatsby-plugin-plausible",
      options: {
        domain: "nextstrain.org",
      },
    },
    "gatsby-plugin-sharp",
    // "gatsby-plugin-catch-links" // See https://github.com/nextstrain/nextstrain.org/issues/34
  ],
};
