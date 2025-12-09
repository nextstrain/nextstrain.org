import React from "react";
import type { Metadata } from "next";

import SarsCov2PageContent from "./content";
import { title } from "./constants";

/** Page metadata */
export const metadata: Metadata = {
  /** The title of the page */
  title,
};

/**
 * A React Server Component for `/sars-cov-2`
 */
export default function SarsCov2Page(): React.ReactElement {
  return (
    <>
      <SarsCov2PageContent />
    </>
  );
}
