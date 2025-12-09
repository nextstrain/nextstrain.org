import React from "react";
import type { Metadata } from "next";

import { ValidateUrl } from "../../../components/error-banner";

import PathogensPageContent from "./content";
import { title } from "./constants";

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
      <PathogensPageContent />
    </>
  );
}
