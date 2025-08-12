import React from "react";
import type { Metadata } from "next";

import GroupsIntro from "./groups-intro";
import GroupsPageRouter from "./router";

const title = "Scalable Sharing with Nextstrain Groups";

export const metadata: Metadata = {
  title,
};

/**
 * A React Server Component for `/groups` and other URLs in that namespace
 *
 * Properly routing `/groups` requests involves things that must
 * happen in a React Client Component, but those can't make use of the
 * Metadata API (which we want to use so we have functional OpenGraph
 * tags, etc.), so this component exists to wrap the router Client
 * Component.
 *
 * See <GroupsPageRouter> for additional information about how URLs
 * that look like `/groups/plus/other/stuff` are routed, how errors
 * are handled, etc.
 */
export default function GroupsPage({
  params,
}: {
  params: { groups?: string[] };
}): React.ReactElement {
  const isMainGroupsPage = !params.groups || params.groups.length === 0;

  return (
    <>
      {isMainGroupsPage && <GroupsIntro />}
      <GroupsPageRouter />
    </>
  );
}
