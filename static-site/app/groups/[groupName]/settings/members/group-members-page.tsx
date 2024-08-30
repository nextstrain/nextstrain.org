'use client'
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { startCase } from "lodash"
import { uri } from "../../../../../../src/templateLiterals";
import GenericPage from "../../../../../src/layouts/generic-page.jsx";
import { BigSpacer, CenteredContainer, FlexGridRight, MediumSpacer } from "../../../../../src/layouts/generalComponents";
import * as splashStyles from "../../../../../src/components/splash/styles";
import { ErrorBanner } from "../../../../../src/components/errorMessages";

interface GroupMember {
  username: string,
  roles: string[]
}

interface ErrorMessage {
  title: string,
  contents: string
}

export default function GroupMembersPage({ groupName }: { groupName: string }) {
  const [ errorMessage, setErrorMessage ] = useState<ErrorMessage>({title: "", contents: ""});
  const [ roles, setRoles ] = useState<string[]>([]);
  const [ members, setMembers ] = useState<GroupMember[]>([]);

  useEffect(() => {
    async function getGroupMembership(groupName: string) {
      const headers = { headers: {"Accept": "application/json"}};
      let roles, members = [];
      try {
        const [ rolesResponse, membersResponse ] = await Promise.all([
          fetch(uri`/groups/${groupName}/settings/roles`, headers),
          fetch(uri`/groups/${groupName}/settings/members`, headers)
        ]);
        if (!rolesResponse.ok) {
          throw new Error(`Fetching group roles failed: ${rolesResponse.status} ${rolesResponse.statusText}`)
        }
        if (!membersResponse.ok) {
          throw new Error(`Fetching group members failed: ${membersResponse.status} ${membersResponse.statusText}`)
        }
        roles = await rolesResponse.json();
        members = await membersResponse.json();
      } catch (err) {
        const errorMessage = (err as Error).message
        if(!ignore) {
          setErrorMessage({
            title: "An error occurred when trying to fetch group membership data",
            contents: errorMessage})
        }
      }
      return {roles, members};
    }

    let ignore = false;
    getGroupMembership(groupName).then(result => {
      if (!ignore) {
        setRoles(result.roles);
        setMembers(result.members);
      }
    })
    return () => {
      ignore = true;
    };
  }, [groupName]);

  return (
    <GenericPage banner={errorMessage.title ? <ErrorBanner {...errorMessage} /> : undefined}>
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

      {roles && members
        ? <MembersTable members={members as GroupMember[]} />
        : <splashStyles.H4>Fetching group members...</splashStyles.H4>}
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
  const sortedMembers = [...members].sort((a, b) => a.username.localeCompare(b.username));
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
