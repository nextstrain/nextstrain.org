import React from "react";

import type { TitledMetadata } from "../types";

import StagingPageContent from "./content";

const title = "Staging Data";

export const metadata: TitledMetadata = {
  title,
};

/**
 * A React Server Component for `/staging`
 */
export default function StagingPage(): React.ReactElement {
  return <StagingPageContent metadata={metadata} />;
}
