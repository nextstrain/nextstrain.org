import React from "react";

import type { TitledMetadata } from "../../types";
import { ValidateUrl } from "../../../components/error-banner";

import SarsCov2PageContent from "./content";

const title = "Nextstrain SARS-CoV-2 resources";

/** Page metadata */
export const metadata: TitledMetadata = {
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
      <ValidateUrl stub="sars-cov-2" />
      <SarsCov2PageContent metadata={metadata} />
    </>
  );
}
