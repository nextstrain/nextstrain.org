"use client";

import React from "react";
import { usePathname } from "next/navigation";

import CommunityRepoPage from "../../../repo-page";

/**
 * Renders an error page for non-existent resource paths.
 *
 * This should only be reached if the server's router (src/routing) does not
 * find an existing resource at the path. Falls back to showing the repo page
 * with an error banner.
 */
export default function NotFound(): React.ReactElement {
  // Parse pathname: /community/{user}/{repo}/{...path}
  const parts = usePathname().split("/"); 
  const user = parts[2] || "";
  const repo = parts[3] || "";
  const path = parts.slice(4).join("/") || "";

  return (
    <CommunityRepoPage
      user={user}
      repo={repo}
      extra={path}
    />
  );
}
