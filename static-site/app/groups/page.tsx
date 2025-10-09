import React from "react";
import type { Metadata } from "next";

import FlexCenter from "../../components/flex-center";
import {FocusParagraphCentered} from "../../components/focus-paragraph";
import { HugeSpacer, SmallSpacer } from "../../components/spacers";
import { groupsTitle, GroupsAbstract } from "../../data/SiteConfig";

import GroupListingPage from "./group-listing-page";

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
      <HugeSpacer />
      <HugeSpacer />

      <h1>{groupsTitle}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          <GroupsAbstract />
        </FocusParagraphCentered>
      </FlexCenter>

      <GroupListingPage />
    </>
  );
}
