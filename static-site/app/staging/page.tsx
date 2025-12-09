import React from "react";
import type { Metadata } from "next";

import StagingPageContent from "./content";
import { title } from "./constants";

export const metadata: Metadata = {
  title,
};

/**
 * A React Server Component for `/staging`
 */
export default function StagingPage(): React.ReactElement {
  return (
    <>
      <StagingPageContent />
    </>
  );
}
