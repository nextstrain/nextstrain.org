import React from "react";
import type { Metadata } from "next";

import CommuityPageRouter from "./router";

const title = "Nextstrain Community: Data Sharing via GitHub";

export const metadata: Metadata = {
  title,
};

/**
 * A React Server Component for `/community` and other URLs in that namespace
 *
 * Properly routing `/community` requests involves things that must
 * happen in a React Client Component, but those can't make use of the
 * Metadata API (which we want to use so we have functional OpenGraph
 * tags, etc.), so this component exists to wrap the router Client
 * Component and inject the page title from the metadata into it.
 *
 * See <CommunityPageRouter> for additional information about how URLs
 * that look like `/community/plus/other/stuff` are routed, how errors
 * are handled, etc.
 */
export default function CommunityPage(): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return <CommuityPageRouter title={metadata.title as string} />;
}
