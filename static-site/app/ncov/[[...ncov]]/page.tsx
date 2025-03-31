import React from "react";
import { Metadata } from "next";

import SarsCov2PageContent from "../../sars-cov-2/[[...sars-cov-2]]/content";
import ValidateNcovUrl from "./validateNcovUrl";

const title = "Nextstrain SARS-CoV-2 resources";

/** page metadata */
export const metadata: Metadata = {
  /** page title */
  title,
};

/**
 * A React Server Component for `/ncov`
 *
 * See note in `static-site/app/staging/[[...staging]]/page.tsx`
 * to understand how this works
 */
export default function SarsCov2Page(): React.ReactElement {
  return (
    <>
      <ValidateNcovUrl />
      <SarsCov2PageContent metadata={metadata} />
    </>
  );
}
