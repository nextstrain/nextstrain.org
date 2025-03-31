import React from "react";
import { Metadata } from "next";

import SarsCov2PageContent from "./content";
import ValidateSarsUrl from "./validateSarsUrl";

const title = "Nextstrain SARS-CoV-2 resources";

/** Page metadata */
export const metadata: Metadata = {
  /** The title of the page */
  title,
};

/**
 * A React Server Component for `/sars-cov-2`
 *
 * See note in `static-site/app/staging/[[...staging]]/page.tsx`
 * to understand how this works
 */
export default function SarsCov2Page(): React.ReactElement {
  return (
    <>
      <ValidateSarsUrl />
      <SarsCov2PageContent metadata={metadata} />
    </>
  );
}
