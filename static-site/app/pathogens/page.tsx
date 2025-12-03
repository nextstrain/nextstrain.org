import React from "react";

import type { TitledMetadata } from "../types";

import PathogensPageContent from "./content";

const title = "Nextstrain-maintained pathogen analyses";

export const metadata: TitledMetadata = {
  title,
};

/**
 * React Server Component for `/pathogens`
 */
export default function Pathogens(): React.ReactElement {
  return (
    <>
      <PathogensPageContent metadata={metadata} />
    </>
  );
}
