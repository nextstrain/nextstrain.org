"use client";

import React, { useEffect, useState } from "react";

import { startCase } from "lodash";

import Button from "../../../../../components/button";
import CenteredContainer from "../../../../../components/centered-container";
import ErrorMessage from "../../../../../components/error-message";
import { FlexGridRight } from "../../../../../components/flex-grid";
import { FocusParagraphCentered } from "../../../../../components/focus-paragraph";
import {
  BigSpacer,
  HugeSpacer,
  MediumSpacer,
} from "../../../../../components/spacers";
import fetchAndParseJSON from "../../../../../util/fetch-and-parse-json";

import styles from "./page.module.css";

interface GroupMember {
  username: string;
  roles: string[];
}

const emptyErrorMessage = {
  title: "",
  contents: <></>,
};

/**
 * A React Client Component to fetch and display the members of a
 * given `group`
 */
export default function GroupMembersPage({
  params,
}: {
  params: {
    /** the name of the group whose members will be shown */
    group: string;
  }
}): React.ReactElement {
  const { group } = params;

  /**
   * the props for an <ErrorMessage> component displayed when there
   * are problems getting the data for the page
   */
  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    contents: React.ReactElement;
  }>(emptyErrorMessage);
  /** the group members to display */
  const [members, setMembers] = useState<GroupMember[]>([]);

  useEffect((): void => {
    document.title =`"${group}" Group Members - Nextstrain`;

    async function getGroupMembership(): Promise<void> {
      try {
        const members = await fetchAndParseJSON<GroupMember[]>(
          `/groups/${group}/settings/members`,
        );
        const sortedMembers = [...members].sort((a, b) =>
          a.username.localeCompare(b.username),
        );

        setMembers(sortedMembers);
      } catch (err) {
        const errorContents = err instanceof Error ? err.message : String(err);
        setErrorMessage({
          title: "An error occurred when trying to fetch group membership data",
          contents: <p>{errorContents}</p>,
        });
        console.error(errorContents);
      }
    }

    getGroupMembership();
  }, [group]);

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      {errorMessage.title && (
        <ErrorMessage
          title={errorMessage.title}
          contents={errorMessage.contents}
        />
      )}

      <FlexGridRight>
        <Button to={`/groups/${group}`}>Return to {`"${group}"`} Page</Button>
      </FlexGridRight>

      <MediumSpacer />

      <h2 className="centered">{`"${group}"`} Group Members</h2>

      <BigSpacer />

      {members.length > 0 ? (
        <CenteredContainer>
          <div className={styles.membersTableContainer}>
            <div className={`${styles.tableRow} row no-gutters`}>
              <div className="col">
                <FocusParagraphCentered>
                  <strong>Username</strong>
                </FocusParagraphCentered>
              </div>
              <div className="col">
                <FocusParagraphCentered>
                  <strong>Roles</strong>
                </FocusParagraphCentered>
              </div>
            </div>

            {members.map(
              (member): React.ReactElement => (
                <div
                  className={`${styles.tableRow} row no-gutters`}
                  key={member.username}
                >
                  <div className="col">
                    <FocusParagraphCentered>
                      {member.username}
                    </FocusParagraphCentered>
                  </div>
                  <div className="col">
                    <FocusParagraphCentered>
                      {_prettifyRoles(member.roles)}
                    </FocusParagraphCentered>
                  </div>
                </div>
              ),
            )}
          </div>
        </CenteredContainer>
      ) : (
        <h4 className="centered">Fetching group members…</h4>
      )}
    </>
  );
}

function _prettifyRoles(roles: string[]): string {
  // Prettify the role names by making them singular and capitalized
  return roles
    .map((role: string): string => startCase(role.replace(/s$/, "")))
    .join(", ");
}
