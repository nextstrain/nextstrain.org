import React, { useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import Select, { MultiValue } from 'react-select';
import styled from "styled-components";
import { startCase } from "lodash"
import { uri } from "../../../src/templateLiterals.js";
import GenericPage from "../layouts/generic-page.jsx";
import { BigSpacer, CenteredContainer, FlexGridRight, MediumSpacer } from "../layouts/generalComponents.jsx";
import * as splashStyles from "../components/splash/styles";
import { ErrorBanner } from "../components/errorMessages.jsx";
import { InputButton } from "../components/Groups/styles.jsx";
import Modal from "../components/modal";

interface GroupMember {
  username: string,
  roles: string[]
}

interface RemoveMemberModalProps {
  groupName: string,
  member: GroupMember,
  isOpen: boolean,
  onClose: () => void,
}

interface SelectOption {
  value: string,
  label: string
}

const GroupMembersPage = ({ groupName }: {groupName: string}) => {
  const [confirmationModalProps, setRemoveMemberModalProps] = useState<RemoveMemberModalProps>({
    groupName: groupName,
    member: {username: "", roles: []},
    isOpen: false,
    onClose: closeConfirmationModal,
  });
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

  function closeConfirmationModal() {
    setRemoveMemberModalProps((prevProps) => ({
      ...prevProps,
      isOpen: false
    }))
  }

  function confirmRemoveMember(member: GroupMember) {
    setRemoveMemberModalProps({
      groupName: groupName,
      member: member,
      isOpen: true,
      onClose: closeConfirmationModal
    })
  }

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

      <RemoveMemberModal {...confirmationModalProps} />

      {(members.isError || roles.isError)
        ? <ErrorBanner
            title="An error occurred when trying to fetch group membership data"
            contents={members.error?.message || roles.error?.message}
           />
        : (members.isLoading || roles.isLoading)
          ? <splashStyles.H4>Fetching group members...</splashStyles.H4>
          : <MembersTable
              groupName={groupName}
              roles={roles.data}
              members={members.data as GroupMember[]}
              canEditMembers={canEditMembers.data}
              confirmRemoveMember={confirmRemoveMember}
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

const MembersTable = ({ groupName, roles, members, canEditMembers, confirmRemoveMember }: {
  groupName: string,
  roles: {name: string}[],
  members: GroupMember[],
  canEditMembers: boolean,
  confirmRemoveMember: (member: GroupMember) => void,
}) => {
  const sortedMembers = members.toSorted((a, b) => a.username.localeCompare(b.username));
  // Prettify the role names by making them singular and capitalized
  const roleNameMap = new Map(roles.map((role) => {
    return [role.name, startCase(role.name.replace(/s$/, ''))]
  }));
  // Convert role names into options for the Select dropdown
  const roleOptions = Array.from(roleNameMap, ([roleName, prettyRoleName]) => ({ value: roleName, label: prettyRoleName}));

  const queryClient = useQueryClient();
  const updateMemberRoles = useMutation({
    mutationFn: (memberData: {member: GroupMember, rolesToRemove: string[], rolesToAdd: string[]}) => {
      const {member, rolesToRemove, rolesToAdd} = memberData;
      const rolesURL = (roleName) => uri`/groups/${groupName}/settings/roles/${roleName}/members/${member.username}`;
      return Promise.all([
        rolesToRemove.map((roleName) => fetch(rolesURL(roleName), {method: "DELETE"})),
        rolesToAdd.map((roleName) => fetch(rolesURL(roleName), {method: "PUT"}))
      ]);
    },
    onSettled: async () => await queryClient.invalidateQueries({ queryKey: ['members', groupName]})
  })

  function prettifyRoles(memberRoles: string[]) {
    return memberRoles.map((roleName) => roleNameMap.get(roleName)).join(", ");
  }

  function currentRoles(member: GroupMember) {
    return roleOptions.filter((roleOption) => member.roles.includes(roleOption.value));
  }

  function selectRolesToUpdate(selectedOptions: MultiValue<SelectOption>, member: GroupMember) {
    // If removing all roles for a member, then confirm that the user intends to remove member from Group
    if (selectedOptions.length === 0) return confirmRemoveMember(member);

    const selectedValues = selectedOptions.map((selectedOption) => selectedOption.value);
    const rolesToRemove = member.roles.filter((roleName) => !selectedValues.includes(roleName));
    const rolesToAdd = selectedValues.filter((selectedValue) => !member.roles.includes(selectedValue));

    updateMemberRoles.mutate({
      member: member,
      rolesToRemove: rolesToRemove,
      rolesToAdd: rolesToAdd
    })
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
            {canEditMembers
              ? <div className="col d-flex justify-content-center">
                  <Select
                    isMulti
                    options={roleOptions}
                    value={currentRoles(member)}
                    onChange={(selectedOptions) => selectRolesToUpdate(selectedOptions, member)}
                  />
                </div>
              : <div className="col">
                  <splashStyles.CenteredFocusParagraph>
                    {prettifyRoles(member.roles)}
                  </splashStyles.CenteredFocusParagraph>
                </div>
              }
          </div>
        )}
      </MembersTableContainer>
    </CenteredContainer>
  )
};

const RemoveMemberModal = ({ groupName, member, isOpen, onClose}: RemoveMemberModalProps) => {
  const [statusText, setStatusText] = useState<string>("");
  const [hideConfirmationButton, setHideConfirmationButton] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const removeMember = useMutation({
    mutationFn: (member: GroupMember) => Promise.all(
        member.roles.map((role) => fetch(uri`/groups/${groupName}/settings/roles/${role}/members/${member.username}`, {method: "DELETE"}))
      ),
    // Invalidate the query cache for members so that it automatically re-fetches latest members
    // For a smoother transition, we can do an optimistic update
    // https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates#via-the-cache
    onSettled: async () => await queryClient.invalidateQueries({ queryKey: ['members', groupName]})
  });

  function onClickConfirm() {
    // TODO: Check that the user being removed is not the sole owner of the Group!
    // If the sole owner of a Group is trying to remove themselves, they should promote someone else to owner before
    // removing themselves OR they should email hello@nextstrain.org to remove the Group completely.
    setHideConfirmationButton(true);
    setStatusText(`Removing ${member.username}...`);
    removeMember.mutate(member, {
      onSuccess: () => {
        setStatusText("");
        setHideConfirmationButton(false);
        onClose();
      },
      onError: (err) => {
        setStatusText(`An error occurred when removing "${member.username}": ${err}. Please try again.`);
        setHideConfirmationButton(false);
      }
    });
  }

  return (
    <Modal
      title="Please confirm you want to remove this member" isOpen={isOpen} onClose={onClose}>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <splashStyles.CenteredFocusParagraph>
            Once removed, "{member.username}" will no longer have a role in the "{groupName}" Group. {<br/>}
            However, they may still have read access if the group is public.
          </splashStyles.CenteredFocusParagraph>
        </div>
      </div>

      {/* TODO: Remove this paragraph once owners can add existing users to a Group */}
      <div className="row">
        <div className="col d-flex justify-content-center">
          <splashStyles.CenteredFocusParagraph>
            Note: You will have to email hello@nextstrain.org to add a member back to the Group.
          </splashStyles.CenteredFocusParagraph>
        </div>
      </div>

      <BigSpacer/>

      <div className="row">
        <div className="col d-flex justify-content-center">
          <splashStyles.CenteredFocusParagraph>{statusText}</splashStyles.CenteredFocusParagraph>
        </div>
      </div>

      <div className="row">
        <div className="col d-flex justify-content-center">
          <InputButton onClick={onClickConfirm} hidden={hideConfirmationButton}>
            Confirm
          </InputButton>
        </div>
      </div>
    </Modal>
  )
}

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
