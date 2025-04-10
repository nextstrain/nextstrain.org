import React from "react";

import { ErrorBanner } from "../../../components/error-banner";

import SarsCov2PageContent from "../../sars-cov-2/[[...sars-cov-2]]/content";

import { metadata } from "./page";

/**
 * A React Server component that renders the usual `/ncov` page
 * content, with an error banner up-top explaining that the requested
 * dataset doesn't actually exist.
 */
export default function FourOhFour(): React.ReactElement {
  const contents = (
    <p>
      {`Here is the SARS-CoV-2 page, where we have listed featured datasets,
        narratives, and resources related to SARS-CoV-2. Note that some SARS-CoV-2
        datasets may not be listed here. For a more comprehensive list of
        Nextstrain-maintained (including SARS-CoV-2) datasets,
        check out `}
      <a href="/pathogens">nextstrain.org/pathogens</a>.
    </p>
  );

  return (
    <>
      <ErrorBanner stub="ncov" contents={contents} />
      <SarsCov2PageContent metadata={metadata} />
    </>
  );
}
