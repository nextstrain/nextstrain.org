import type { Metadata } from "next";
import React from "react";

import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import { BigSpacer } from "../../components/spacers";
import { TeamPageList } from "../../components/people/avatars";

import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "Team",
};

/**
 * A React Server Component that renders the /team page
 */
export default function TeamPage(): React.ReactElement {
  return (
    <div className={styles.teamPage}>
      <BigSpacer count={4} />

      <h1>Nextstrain core team</h1>

      <FlexCenter>
        <FocusParagraphCentered>
          Nextstrain was co-founded by:
        </FocusParagraphCentered>
      </FlexCenter>
      <TeamPageList membersKey="founders" />

      <FlexCenter>
        <FocusParagraphCentered>
          The core team currently working on Nextstrain are:
        </FocusParagraphCentered>
      </FlexCenter>
      <TeamPageList membersKey="core" />

      <h1>Nextstrain Alumni</h1>
      <FlexCenter>
        <FocusParagraphCentered>
          Our previous core Nextstrain team members, some of whom are still
          working on projects involving Nextstrain and/or maintaining specific
          analyses. Beyond the core team there have been many code contributions
          from the wider scientific and programming community; please see{" "}
          <a href="https://github.com/nextstrain">our GitHub organization</a> to
          see the history of (code) contributions.
        </FocusParagraphCentered>
      </FlexCenter>
      <BigSpacer />
      <TeamPageList membersKey="alumni" />

      <h1>Scientific Advisory Board</h1>
      <FlexCenter>
        <FocusParagraphCentered>
          In Oct 2023, a scientific advisory board was founded to provide
          guidance on future directions for the Nextstrain project.
        </FocusParagraphCentered>
      </FlexCenter>
      <TeamPageList membersKey="board" />
    </div>
  );
}
