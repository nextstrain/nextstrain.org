import React from "react";

import SarsCov2PageContent from "../../sars-cov-2/[[...sars-cov-2]]/content";

import ErrorBanner from "./error-banner";
import { metadata } from "./page";

/**
 * A React Server component that renders the usual `/ncov` page
 * content, with an error banner up-top explaining that the requested
 * dataset doesn't actually exist.
 */
export default function FourOhFour(): React.ReactElement {
  return (
    <>
      <ErrorBanner />
      <SarsCov2PageContent metadata={metadata} />
    </>
  );
}
