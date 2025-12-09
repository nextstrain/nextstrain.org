import React from "react";
import type { Metadata } from "next";

import { ValidateUrl } from "../../../components/error-banner";

import SarsCov2PageContent from "../../sars-cov-2/[[...sars-cov-2]]/content";
import { title } from "../../sars-cov-2/[[...sars-cov-2]]/constants";

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
      <ValidateUrl stub="ncov" />
      <SarsCov2PageContent />
    </>
  );
}
