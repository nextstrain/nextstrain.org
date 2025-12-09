import React from "react";
import type { Metadata } from "next";

import PathogensPageContent from "./content";
import { title } from "./constants";

export const metadata: Metadata = {
  title,
};

/**
 * React Server Component for `/pathogens`
 */
export default function Pathogens(): React.ReactElement {
  return (
    <>
      <PathogensPageContent />
    </>
  );
}
