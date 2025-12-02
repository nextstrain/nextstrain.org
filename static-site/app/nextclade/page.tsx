import React from "react";

import type { TitledMetadata } from "../types";

import NextcladePageContent from "./content";

const title = "Nextclade reference trees";

export const metadata: TitledMetadata = {
  title,
};

/**
 * A React Server Component for `/nextclade`
 *
 * This page handles the base `/nextclade` route and displays a resource
 * listing of Nextclade reference trees.
 */
export default function NextcladePage(): React.ReactElement {
  return <NextcladePageContent metadata={metadata} />;
}
