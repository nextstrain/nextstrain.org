import React from "react";
import { Metadata } from "next";

import PathogensPageContent from "./content";
import ValidatePathogensUrl from "./validatePathogensUrl";

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
      <ValidatePathogensUrl />
      <PathogensPageContent metadata={metadata} />
    </>
  );
}
