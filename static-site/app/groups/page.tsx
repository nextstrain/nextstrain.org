import React from "react";
import type { Metadata } from "next";

import GroupsIntro from "./intro";
import Available from "./available";
import { groupsTitle } from "../../data/SiteConfig";

export const metadata: Metadata = {
  title: groupsTitle,
};

/**
 * A React Server Component for `/groups` page, including title,
 * abstract, and overall groups listing with tiles UI
 */
export default function GroupsPage(): React.ReactElement {
  return (
    <>
      <GroupsIntro />
      <Available />
    </>
  );
}
