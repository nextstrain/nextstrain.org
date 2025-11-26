import React from "react";

import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import { HugeSpacer, SmallSpacer } from "../../components/spacers";
import { groupsTitle, GroupsAbstract } from "../../data/SiteConfig";

/**
 * A React Server Component to render the groups page title and abstract
 *
 * This is split out from the other groups content so it can be
 * rendered on the server.
 */
export default function GroupsIntro(): React.ReactElement {
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
    </>
  );
}
