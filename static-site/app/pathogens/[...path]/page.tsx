import React from "react";

import { ErrorBanner } from "../../../components/error-banner";

import PathogensPageContent from "../content";
import { metadata } from "../page";

/**
 * A React Server component that renders the usual `/pathogens` page
 * content, with an error banner up-top explaining that the requested
 * dataset doesn't actually exist.
 */
export default function FourOhFour({
  params
}: {
  params: {
    path: string[]
  }
}): React.ReactElement {
  return (
    <>
      <ErrorBanner stub="pathogens" path={params.path.join("/")} />
      <PathogensPageContent metadata={metadata} />
    </>
  );
}
