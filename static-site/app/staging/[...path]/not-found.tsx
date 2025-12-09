import React from "react";

import { ErrorBanner } from "../../../components/error-banner";

import StagingPageContent from "../content";

export { metadata } from "../page";

/**
 * A React Server component that renders the usual `/staging` page
 * content, with an error banner up-top explaining that the requested
 * dataset doesn't actually exist.
 */
export default function FourOhFour(): React.ReactElement {
  return (
    <>
      <ErrorBanner stub="staging" />
      <StagingPageContent />
    </>
  );
}
