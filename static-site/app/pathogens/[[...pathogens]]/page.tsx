import React from "react";
import { Metadata } from "next";

import { ValidateUrl } from "../../../components/error-banner";

import PathogensPageContent from "./content";

const title = "Nextstrain-maintained pathogen analyses";

export const metadata: Metadata = {
  title,
};

/**
 * React Server Component for `/pathogens`
 *
 * See note in `static-site/app/staging/[[...staging]]/page.tsx`
 * to understand how this works
 */
export default function Pathogens(): React.ReactElement {
  return (
    <>
      <ValidateUrl stub="pathogens" />
      <PathogensPageContent metadata={metadata} />
    </>
  );
}
