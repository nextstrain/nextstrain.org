import React, { Component } from "react";
import Head from "next/head";
import { siteLogo, siteUrl, siteDescription, siteTitle, siteTitleAlt } from "../../../data/SiteConfig";

const pathPrefix = "/"

class SEO extends Component {
  render() {
    const title = this.props.title || siteTitle;
    const description = this.props.description || siteDescription;
    const postSEO = !!this.props.blogUrlName;
    /** The terminology here ('postUrl', 'blogURL') is carried over from an
     * ancient Gatsby iteration of the website, which itself was probably copied
     * from a template. */
    const postURL = this.props.blogUrlName ? `${siteUrl}${pathPrefix}blog/${this.props.blogUrlName}` : undefined;
    const realPrefix = pathPrefix === "/" ? "" : pathPrefix;
    const image = siteUrl + realPrefix + siteLogo;
    const blogURL = siteUrl + pathPrefix;
    const schemaOrgJSONLD = [
      {
        "@context": "http://schema.org",
        "@type": "WebSite",
        url: blogURL,
        name: title,
        alternateName: siteTitleAlt ? siteTitleAlt : ""
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
          alternateName: siteTitleAlt ? siteTitleAlt : "",
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
      <Head>
        {/* General tags */}
        <meta name="description" content={description} />
        <meta name="image" content={image} />

        {/* Schema.org tags */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgJSONLD)}
        </script>

        {/* OpenGraph tags */}
        <meta property="og:url" content={postSEO ? postURL : blogURL} />
        {postSEO ? <meta property="og:type" content="article" /> : null}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
      </Head>
    );
  }
}

export default SEO;
