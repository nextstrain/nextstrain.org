import React from "react";

import Footer from "../../components/footer";
import Nav from "../../components/nav";

/**
 * Build-time snapshot source for the static blog's site chrome.
 *
 * This route renders ONLY the real <Nav/> and <Footer/> components (the same
 * ones the root layout puts on every page), each wrapped in a unique custom
 * element so a build step can extract them from the rendered HTML without an
 * HTML parser. See scripts/gazette-blog/snapshot-chrome.mjs, which fetches this
 * page, pulls out the two fragments and the CSS the page links, and feeds them
 * to the static blog build — so the chrome on gazette blog pages is generated
 * from the real components and cannot drift from the rest of the site.
 *
 * The root layout still wraps this page in its own Nav/Footer; the snapshot
 * only reads what's inside the custom-element markers below, so the duplicates
 * are harmless. Not linked from anywhere in the UI.
 *
 * `force-static` so it prerenders to a plain HTML document.
 */
export const dynamic = "force-static";

export default function ChromeSnapshot(): React.ReactElement {
  return (
    <>
      {React.createElement("gazette-chrome-header", null, <Nav />)}
      {React.createElement("gazette-chrome-footer", null, <Footer />)}
    </>
  );
}
