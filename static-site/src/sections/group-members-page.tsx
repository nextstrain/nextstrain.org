import React from "react";
import { useQueries } from "@tanstack/react-query";
import styled from "styled-components";
import { startCase } from "lodash"
import { uri } from "../../../src/templateLiterals.js";
import GenericPage from "../layouts/generic-page.jsx";
import { BigSpacer, CenteredContainer, FlexGridRight, MediumSpacer } from "../layouts/generalComponents.jsx";
import * as splashStyles from "../components/splash/styles";
import { ErrorBanner } from "../components/errorMessages.jsx";

interface GroupMember {
  username: string,
  roles: string[]
}

const GroupMembersPage = ({ groupName }: {groupName: string}) => {
  const [roles, members] = useQueries({
    queries: [
      {
        queryKey: ['roles', groupName],
        queryFn: async () => {
          const rolesResponse = await fetch(uri`/groups/${groupName}/settings/roles`, {headers: {"Accept": "application/json"}})
          if (!rolesResponse.ok) {
            throw new Error(`Fetching group roles failed: ${rolesResponse.status} ${rolesResponse.statusText}`)
          }
          return rolesResponse.json();
        },
      },
      {
        queryKey: ['members', groupName],
        queryFn: async () => {
          const membersResponse = await fetch(uri`/groups/${groupName}/settings/members`, {headers: {"Accept": "application/json"}})
          if (!membersResponse.ok) {
            throw new Error(`Fetching group members failed: ${membersResponse.status} ${membersResponse.statusText}`)
          }
          return membersResponse.json();
        },
      }
    ]
  })

  return (
    <GenericPage banner={null}>
      <FlexGridRight>
        <splashStyles.Button to={uri`/groups/${groupName}`}>
          Return to {`"${groupName}"`} Page
        </splashStyles.Button>
      </FlexGridRight>
      <MediumSpacer/>

      <splashStyles.H2>
        {`"${groupName}"`} Group Members
      </splashStyles.H2>
      <BigSpacer/>

      {(members.isError || roles.isError)
        ? <ErrorBanner
            title="An error occurred when trying to fetch group membership data"
            contents={members.error?.message || roles.error?.message}
           />
        : (members.isLoading || roles.isLoading)
          ? <splashStyles.H4>Fetching group members...</splashStyles.H4>
          : <MembersTable members={members.data as GroupMember[]} />
      }

    </GenericPage>
  )
};

const MembersTableContainer = styled.div`
  border: 1px solid #CCC;
  .row {
    border-bottom: 1px solid #CCC;
  }
  .row:last-child {
    border-bottom: 0;
  }
  .row:nth-child(even) {
    background-color: #F1F1F1;
  }
  p {
    margin: 10px;
  }
`;

const MembersTable = ({ members }: { members: GroupMember[]}) => {
  const sortedMembers = members.toSorted((a, b) => a.username.localeCompare(b.username));
  function prettifyRoles(memberRoles: string[]) {
    // Prettify the role names by making them singular and capitalized
    return memberRoles.map((roleName) => startCase(roleName.replace(/s$/, ''))).join(", ");
  }

  return (
    <CenteredContainer>
      <MembersTableContainer>
        <div className="row no-gutters">
          <div className="col">
            <splashStyles.CenteredFocusParagraph>
              <strong>Username</strong>
            </splashStyles.CenteredFocusParagraph>
          </div>
          <div className="col">
            <splashStyles.CenteredFocusParagraph>
              <strong>Roles</strong>
            </splashStyles.CenteredFocusParagraph>
          </div>
        </div>

        {sortedMembers.map((member) =>
          <div className="row no-gutters" key={member.username}>
            <div className="col">
              <splashStyles.CenteredFocusParagraph>
                {member.username}
              </splashStyles.CenteredFocusParagraph>
            </div>
            <div className="col">
              <splashStyles.CenteredFocusParagraph>
                {prettifyRoles(member.roles)}
              </splashStyles.CenteredFocusParagraph>
            </div>
          </div>
        )}
      </MembersTableContainer>
    </CenteredContainer>
  )
};

export async function canViewGroupMembers(groupName: string) {
  try {
    const groupMemberOptions = await fetch(uri`/groups/${groupName}/settings/members`, { method: "OPTIONS"});
      if ([401, 403].includes(groupMemberOptions.status)) {
        console.log("You can ignore the console error above; it is used to determine whether the members can be shown.");
      }
      const allowedMethods = new Set(groupMemberOptions.headers.get("Allow")?.split(/\s*,\s*/));
      return allowedMethods.has("GET");
  } catch (err) {
    const errorMessage = (err as Error).message
    console.error("Cannot check user permissions to view group members", errorMessage);
  }
  return false
}

export default GroupMembersPage;
