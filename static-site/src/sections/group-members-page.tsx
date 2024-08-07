import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
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

interface ErrorMessage {
  title: string,
  contents: string
}

const GroupMembersPage = ({ groupName }: {groupName: string}) => {
  const [ errorMessage, setErrorMessage ] = useState<ErrorMessage>({title: "", contents: ""});
  const [ roles, setRoles ] = useState<string[]>([]);
  const [ members, setMembers ] = useState<GroupMember[]>([]);
  const [ canEditMembers, setCanEditMembers ] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    getGroupMembership(groupName).then(result => {
      if (!ignore) {
        setRoles(result.roles);
        setMembers(result.members);
        setCanEditMembers(result.canEditMembers);
      }
    })
    return () => {
      ignore = true;
    };
  }, [groupName]);

  async function getGroupMembership(groupName: string) {
    const headers = { headers: {"Accept": "application/json"}};
    const canEditMembers = await canEditGroupMembers(groupName);
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
      setErrorMessage({
        title: "An error occurred when trying to fetch group membership data",
        contents: errorMessage})
    }
    return {canEditMembers, roles, members};
  };

  async function removeMember(member: GroupMember) {
    const responses = await Promise.all(
      member.roles.map((role) => fetch(uri`/groups/${groupName}/settings/roles/${role}/members/${member.username}`, {method: "DELETE"}))
    );
    if (responses.every((response) => response.ok)) {

    }
  }

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
        ? <MembersTable
            roles={roles as string[]}
            members={members as GroupMember[]}
            canEditMembers={canEditMembers}
            removeMember={removeMember}
          />
        : <splashStyles.H4>Fetching group members...</splashStyles.H4>}
    </GenericPage>
  )
};

const MembersTable = ({ roles, members, canEditMembers, removeMember }:
  {
    roles: string[],
    members: GroupMember[],
    canEditMembers: boolean,
    removeMember: (member: GroupMember) => void
  }) => {
  const sortedMembers = members.toSorted((a, b) => a.username.localeCompare(b.username));
  function mostPrivilegedRole(memberRoles: string[]) {
    // Assumes that the provided roles are listed in order of least to most privileged
    return memberRoles.reduce((a, b) => roles.indexOf(a) > roles.indexOf(b) ? a : b);
  }

  return (
    <CenteredContainer>
      <div className="row">
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
      <div className="row" key={member.username}>
        <div className="col">
          <splashStyles.CenteredFocusParagraph>
            {member.username}
          </splashStyles.CenteredFocusParagraph>
        </div>
        <div className="col">
          <splashStyles.CenteredFocusParagraph>
            {mostPrivilegedRole(member.roles)}
          </splashStyles.CenteredFocusParagraph>
        </div>
        {canEditMembers &&
          <div className="col d-flex align-items-center justify-content-center">
            <InputButton onClick={() => removeMember(member)}>
              <FaTrash/>
            </InputButton>
          </div>}
      </div>
      )}
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
