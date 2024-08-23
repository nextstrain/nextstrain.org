import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styled from "styled-components";
import { startCase } from "lodash"
import { uri } from "../../../src/templateLiterals.js";
import { BigSpacer, CenteredContainer, FlexGridRight, MediumSpacer } from "../layouts/generalComponents.jsx";
import * as splashStyles from "../components/splash/styles";
import Modal from "../components/modal";
import { InputButton } from "../components/Groups/styles";

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

const GroupMembersPage = ({ groupName, roles, members, canEditGroupMembers }: {
  groupName: string,
  roles: string[],
  members: GroupMember[],
  canEditGroupMembers: boolean,
}) => {
  const [confirmationModalProps, setRemoveMemberModalProps] = useState<RemoveMemberModalProps>({
    groupName: groupName,
    member: {username: "", roles: []},
    isOpen: false,
    onClose: closeConfirmationModal,
  });

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
    <>
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

      <MembersTable
        members={members as GroupMember[]}
        canEditMembers={canEditGroupMembers}
        confirmRemoveMember={confirmRemoveMember} />
    </>
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
  // Adding !important to enforce this styling override.
  // It's unclear why this styling override no longer worked when I switched to SSR
  // Maybe related to https://github.com/styled-components/styled-components/issues/3411
  p {
    margin: 10px !important;
  }
`;

const MembersTable = ({ members, canEditMembers, confirmRemoveMember }: {
  members: GroupMember[],
  canEditMembers: boolean,
  confirmRemoveMember: (member: GroupMember) => void,
}) => {
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
                <InputButton onClick={() => confirmRemoveMember(member)}>
                  <strong>X</strong>
                </InputButton>
              </div>}
          </div>
        )}
      </MembersTableContainer>
    </CenteredContainer>
  )
};

const RemoveMemberModal = ({ groupName, member, isOpen, onClose}: RemoveMemberModalProps) => {
  const [statusText, setStatusText] = useState<string>("");
  const [hideConfirmationButton, setHideConfirmationButton] = useState<boolean>(false);
  const router = useRouter();
  async function removeMember(member: GroupMember){

    const responses = await Promise.all(
      member.roles.map((role) => fetch(uri`/groups/${groupName}/settings/roles/${role}/members/${member.username}`, {method: "DELETE"}))
    )
    if (!responses.every((response) => response.ok)) {
      setStatusText(`An error occurred when removing "${member.username}". Please try again.`);
      setHideConfirmationButton(false);
    } else {
      setStatusText("");
      setHideConfirmationButton(false);
      onClose();
      router.refresh();
    }
  }

  function onClickConfirm() {
    // TODO: Check that the user being removed is not the sole owner of the Group!
    // If the sole owner of a Group is trying to remove themselves, they should promote someone else to owner before
    // removing themselves OR they should email hello@nextstrain.org to remove the Group completely.
    setHideConfirmationButton(true);
    setStatusText(`Removing ${member.username}...`);
    removeMember(member);
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

export default GroupMembersPage;
