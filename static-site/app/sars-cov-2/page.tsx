import React from "react";

import type { TitledMetadata } from "../types";

import SarsCov2PageContent from "./content";

const title = "Nextstrain SARS-CoV-2 resources";

/** Page metadata */
export const metadata: TitledMetadata = {
  /** The title of the page */
  title,
};

/**
 * A React Server Component for `/sars-cov-2`
 */
export default function SarsCov2Page(): React.ReactElement {
  return (
    <>
      <SarsCov2PageContent metadata={metadata} />
    </>
  );
}
