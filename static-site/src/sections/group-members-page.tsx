import React from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { startCase } from "lodash"
import { uri } from "../../../src/templateLiterals.js";
import GenericPage from "../layouts/generic-page.jsx";
import { BigSpacer, CenteredContainer, FlexGridRight, MediumSpacer } from "../layouts/generalComponents.jsx";
import * as splashStyles from "../components/splash/styles";
import { ErrorBanner } from "../components/errorMessages.jsx";
import { InputButton } from "../components/Groups/styles.jsx";

interface GroupMember {
  username: string,
  roles: string[]
}

const GroupMembersPage = ({ groupName }: {groupName: string}) => {
  const [roles, members, canEditMembers] = useQueries({
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
      },
      {
        queryKey: ['canEditMembers', groupName],
        queryFn: async () => canEditGroupMembers(groupName),
        initialData: false,
      }
    ]
  })

  const queryClient = useQueryClient();
  // TODO: Trigger confirmation modal before removing member
  // TODO: Trigger error modal if an error occurs during removal
  const { mutate: removeMember } = useMutation({
    mutationFn: (member: GroupMember) => Promise.all(
        member.roles.map((role) => fetch(uri`/groups/${groupName}/settings/roles/${role}/members/${member.username}`, {method: "DELETE"}))
      ),
    // Invalidate the query cache for members so that it automatically re-fetches latest members
    // For a smoother transition, we can do an optimistic update
    // https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates#via-the-cache
    onSettled: async () => await queryClient.invalidateQueries({ queryKey: ['members', groupName]})
  });

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
          : <MembersTable
              members={members.data as GroupMember[]}
              canEditMembers={canEditMembers.data}
              removeMember={removeMember}
            />
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

const MembersTable = ({ members, canEditMembers, removeMember }: {
  members: GroupMember[],
  canEditMembers: boolean,
  removeMember: (member: GroupMember) => void
}) => {
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
          {canEditMembers &&
            <div className="col">
              <splashStyles.CenteredFocusParagraph>
                <strong>Remove Member</strong>
              </splashStyles.CenteredFocusParagraph>
            </div>}
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
            {canEditMembers &&
              <div className="col d-flex justify-content-center">
                <InputButton onClick={() => removeMember(member)}>
                  <strong>X</strong>
                </InputButton>
              </div>}
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

async function canEditGroupMembers(groupName: string) {
  // Use placeholder string for role + username in request since this is only checking user permissions
  const placeholder: string = "PLACEHOLDER";
  try {
    const groupMemberOptions = await fetch(uri`/groups/${groupName}/settings/roles/${placeholder}/members/${placeholder}`, { method: "OPTIONS" });
    if ([401, 403].includes(groupMemberOptions.status)) {
      console.log("You can ignore the console error above; it is used to determine whether the user can edit members is shown.");
    }
    const allowedMethods = new Set(groupMemberOptions.headers.get("Allow")?.split(/\s*,\s*/));
    const editMethods = ["PUT", "DELETE"];
    return editMethods.every((method) => allowedMethods.has(method));
  } catch (err) {
    const errorMessage = (err as Error).message
    console.error("Cannot check user permissions to edit group members", errorMessage);
  }
  return false
}

export default GroupMembersPage;
