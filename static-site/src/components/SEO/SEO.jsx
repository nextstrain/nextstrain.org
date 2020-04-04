import React, { Component } from "react";
import Helmet from "react-helmet";
import config from "../../../data/SiteConfig";

// eslint-disable-next-line react/prefer-stateless-function
class SEO extends Component {
  render() {
    const { postNode, postPath, postSEO } = this.props;
    let title;
    let description;
    let image;
    let postURL;
    if (postSEO) {
      const postMeta = postNode.frontmatter;
      title = postMeta.title;
      description = postMeta.description
        ? postMeta.description
        : postNode.excerpt;
      image = postMeta.cover || config.siteLogo;
      postURL = config.siteUrl + config.pathPrefix + postPath;
    } else {
      title = config.siteTitle;
      description = config.siteDescription;
      image = config.siteLogo;
    }
    const realPrefix = config.pathPrefix === "/" ? "" : config.pathPrefix;
    image = config.siteUrl + realPrefix + image;
    const blogURL = config.siteUrl + config.pathPrefix;
    const schemaOrgJSONLD = [
      {
        "@context": "http://schema.org",
        "@type": "WebSite",
        url: blogURL,
        name: title,
        alternateName: config.siteTitleAlt ? config.siteTitleAlt : ""
      }
    ];
    if (postSEO) {
      schemaOrgJSONLD.push([
        {
          "@context": "http://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@id": postURL,
                name: title,
                image
              }
            }
          ]
        },
        {
          "@context": "http://schema.org",
          "@type": "BlogPosting",
          url: blogURL,
          name: title,
          alternateName: config.siteTitleAlt ? config.siteTitleAlt : "",
          headline: title,
          image: {
            "@type": "ImageObject",
            url: image
          },
          description
        }
      ]);
    }
    return (
      <Helmet>
        {/* General tags */}
        <meta charset="utf-8" />
        <meta name="description" content={description} />
        <meta name="image" content={image} />

        {/* Schema.org tags */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgJSONLD)}
        </script>

        {/* OpenGraph tags */}
        <meta property="og:url" content={postSEO ? postURL : blogURL} />
        {postSEO ?
          <meta property="og:type" content="article" /> :
          <meta property="og:type" content="website" />
        }
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        {config.siteFBAppID ?
          <meta property="fb:app_id" content={config.siteFBAppID} /> :
          null
        }

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </Helmet>
    );
  }
}

export default SEO;
