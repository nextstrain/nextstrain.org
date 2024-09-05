import { Html, Head, Main, NextScript } from "next/document";
import { blogFeedUrls, groupsApp } from "../data/SiteConfig";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {
          !groupsApp &&
          <>
            <link rel="me" href="https://mstdn.science/@nextstrain" />
            <link href={`${blogFeedUrls.atom}`} rel="alternate" title="Atom feed for nextstrain.org/blog" type="application/atom+xml" />
            <link href={`${blogFeedUrls.json}`} rel="alternate" title="JSON feed for nextstrain.org/blog" type="application/json" />
            <link href={`${blogFeedUrls.rss2}`} rel="alternate" title="RSS2 feed for nextstrain.org/blog" type="application/rss+xml" />
          </>
        }
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
