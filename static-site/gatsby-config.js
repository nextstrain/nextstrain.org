const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("./data/SiteConfig");
const {potentialAuspiceRoutes} = require("../auspicePaths");

// const pathPrefix = config.pathPrefix === "/" ? "" : config.pathPrefix;

module.exports = {
  pathPrefix: config.pathPrefix,
  // siteMetadata: {
  //   siteUrl: config.siteUrl + pathPrefix,
  //   rssMetadata: {
  //     site_url: config.siteUrl + pathPrefix,
  //     feed_url: config.siteUrl + pathPrefix + config.siteRss,
  //     title: config.siteTitle,
  //     description: config.siteDescription,
  //     image_url: `${config.siteUrl + pathPrefix}/logos/logo-512.png`,
  //     author: config.userName,
  //     copyright: config.copyright
  //   }
  // },
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
    // {
    //   resolve: "gatsby-plugin-google-analytics",
    //   options: {
    //     trackingId: config.googleAnalyticsID
    //   }
    // },
    {
      resolve: "gatsby-plugin-nprogress",
      options: {
        color: config.progressBarColor
      }
    },
    "gatsby-plugin-sharp",
    // "gatsby-plugin-catch-links" // See https://github.com/nextstrain/nextstrain.org/issues/34
  ],
  developMiddleware: app => {
    ['/charon', '/dist', ...potentialAuspiceRoutes].forEach(path => {
      app.use(
        path,
        createProxyMiddleware({
          target: "http://localhost:5000",
        })
      );
    });
  },
};
