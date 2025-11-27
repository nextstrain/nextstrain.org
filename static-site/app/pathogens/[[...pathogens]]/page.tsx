import React from "react";

import type { TitledMetadata } from "../../types";
import { ValidateUrl } from "../../../components/error-banner";

import PathogensPageContent from "./content";

const title = "Nextstrain-maintained pathogen analyses";

export const metadata: TitledMetadata = {
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
