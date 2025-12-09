"use client";

import React from "react";

import ErrorMessage from "../../components/error-message";
import CommunityPageContent from "./content";
import { usePathname } from "next/navigation";

/**
 * Renders an error page for incomplete user-only paths.
 */
export function MissingRepoErrorPage({
  user,
}: {
  user: string;
}): React.ReactElement {
  const errorPath = "nextstrain.org" + usePathname();
  return (
    <>
      <ErrorMessage
        title={`The path "${errorPath}" is not valid. If you are looking for resources under "${user}", add a repo to the path: "${errorPath}/{repo}"`}
        contents={<p>Here is the community page instead.</p>}
      />
      <CommunityPageContent />
    </>
  );
}
