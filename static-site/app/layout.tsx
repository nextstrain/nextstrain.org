import { Metadata } from "next";
import { Lato } from "next/font/google";
import React from "react";

import { BigSpacer } from "../components/spacers";
import Footer from "../components/footer";
import Line from "../components/line";
import Nav from "../components/nav";
import PlausibleAnalytics from "../components/plausible-analytics/";
import {
  blogFeedUrls,
  groupsApp,
  siteTitle,
  siteTitleAlt,
} from "../data/BaseConfig";
import UserDataWrapper from "../components/user-data-wrapper";

import "./styles/browserCompatability.css";
import "./styles/bootstrap.css";
import "./styles/globals.css";

// Custom fonts bundled (i.e. no external requests), see
// <https://nextjs.org/docs/pages/building-your-application/optimizing/fonts>
const lato = Lato({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--lato",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: {
    absolute: siteTitle,
    template: `%s - ${siteTitle}`,
  },
  description: siteTitleAlt,
};

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
