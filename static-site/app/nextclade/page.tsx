import React from "react";
import type { Metadata } from "next";

import NextcladePageContent from "./content";
import { title } from "./constants";

export const metadata: Metadata = {
  title,
};

/**
 * A React Server Component for `/nextclade`
 */
export default function NextcladePage(): React.ReactElement {
  return (
    <>
      <NextcladePageContent />
    </>
  );
}
