import React from "react";

import { ErrorBanner } from "../../../components/error-banner";

import NextcladePageContent from "./content";
import { metadata } from "./page";

/**
 * A React Server component that renders the usual `/nextclade` page
 * content, with an error banner up-top explaining that the requested
 * dataset doesn't actually exist.
 */
export default function FourOhFour(): React.ReactElement {
  return (
    <>
      <ErrorBanner stub="nextclade" />
      <NextcladePageContent metadata={metadata} />
    </>
  );
}
