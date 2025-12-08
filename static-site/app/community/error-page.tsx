"use client";

import React from "react";

import ErrorMessage from "../../components/error-message";
import CommunityPageContent from "./content";
import { usePathname } from "next/navigation";

/**
 * Renders a generic error page.
 */
export function MissingRepoErrorPage(): React.ReactElement {
  const errorPath = "nextstrain.org" + usePathname();
  return (
    <>
      <ErrorMessage
        title={`The community repository, dataset, or narrative "${errorPath}" doesn't exist.`}
        contents={<p>Here is the community page instead.</p>}
      />
      <CommunityPageContent />
    </>
  );
}
