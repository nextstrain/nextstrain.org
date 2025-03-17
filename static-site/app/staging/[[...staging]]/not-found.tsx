import React from "react";

import StagingPageContent from "./content";
import ErrorBanner from "./error-banner";
import { metadata } from "./page";

/**
 * A React Server component that renders the usual `/staging` page
 * content, with an error banner up-top explaining that the requested
 * dataset doesn't actuall exist.
 */
export default function FourOhFour(): React.ReactElement {
  return (
    <>
      <ErrorBanner />
      <StagingPageContent metadata={metadata} />
    </>
  );
}
