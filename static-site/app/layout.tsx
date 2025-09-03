import React from "react";
import { Metadata } from "next";
import { Lato } from "next/font/google";

import { BigSpacer } from "../components/spacers";
import Footer from "../components/footer";
import Line from "../components/line";
import Nav from "../components/nav";
import PlausibleAnalytics from "../components/plausible-analytics/";
import {
  blogFeedUrls,
  groupsApp,
  siteLogo,
  siteTitle,
  siteTitleAlt,
  siteUrl,
} from "../data/BaseConfig";
import UserDataWrapper from "../components/user-data-wrapper";

import "./styles/browserCompatability.css";
import "./styles/bootstrap.css";
import "./styles/globals.css";

/**
 *  Custom fonts bundled (i.e. no external requests), see
 * <https://nextjs.org/docs/pages/building-your-application/optimizing/fonts>
 */
const lato = Lato({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--lato",
  weight: ["300", "400", "700"],
});

/**
 * data used to generate the metadata tags in the <head>
 */
export const metadata: Metadata = {
  title: {
    absolute: siteTitle,
    template: `%s - ${siteTitle}`,
  },
  description: siteTitleAlt,
  openGraph: {
    title: siteTitle,
    description: siteTitleAlt,
    url: siteUrl,
    siteName: siteTitle,
    images: [{ url: `${siteUrl}${siteLogo}` }],
    locale: "en_US",
    type: "website",
  },
};

/**
 * data used to generate JSON-LD schema script in the <head>
 */
const jsonLd: string = JSON.stringify({
  "@context": "http://schema.org",
  "@type": "WebSite",
  url: siteUrl,
  name: siteTitle,
  image: `${siteUrl}${siteLogo}`,
  alternateName: "Real-time tracking of pathogen evolution",
})
  // unicode-encode `<` to guard against potential XSS/HTML injection
  .replace(/</g, "\\u003c");

/**
 * A React Component that provides the overall page layout used by
 * every page on the site.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <head>
        {!groupsApp && (
          <>
            <link rel="me" href="https://mstdn.science/@nextstrain" />
            <link
              href={`${blogFeedUrls.atom}`}
              rel="alternate"
              title="Atom feed for nextstrain.org/blog"
              type="application/atom+xml"
            />
            <link
              href={`${blogFeedUrls.json}`}
              rel="alternate"
              title="JSON feed for nextstrain.org/blog"
              type="application/json"
            />
            <link
              href={`${blogFeedUrls.rss2}`}
              rel="alternate"
              title="RSS2 feed for nextstrain.org/blog"
              type="application/rss+xml"
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: jsonLd,
              }}
            />
          </>
        )}
      </head>
      <body className={lato.variable}>
        <UserDataWrapper>
          <Nav />

          <main>
            {children}

            <Line />

            <Footer />

            <BigSpacer />
          </main>
          <PlausibleAnalytics />
        </UserDataWrapper>
      </body>
    </html>
  );
}
