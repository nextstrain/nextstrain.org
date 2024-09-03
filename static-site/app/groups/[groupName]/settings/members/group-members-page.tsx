'use client'
import React, { useState } from "react";
import styled from "styled-components";
import { startCase } from "lodash"
import { uri } from "../../../../../../src/templateLiterals";
import GenericPage from "../../../../../src/layouts/generic-page.jsx";
import { BigSpacer, CenteredContainer, FlexGridRight, MediumSpacer } from "../../../../../src/layouts/generalComponents";
import * as splashStyles from "../../../../../src/components/splash/styles";
import { ErrorBanner } from "../../../../../src/components/errorMessages";
import { InputButton } from "../../../../../src/components/Groups/styles";
import { RemoveMemberModal } from "./modal";
import { GroupMember, ErrorMessage, RemoveMemberModalProps } from "./types";

export default function GroupMembersPage({ groupName, roles, members, canEditGroupMembers, errorMessage }: {
  groupName: string,
  roles: string[],
  members: GroupMember[],
  canEditGroupMembers: boolean,
  errorMessage: ErrorMessage,
}) {
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

      <RemoveMemberModal {...confirmationModalProps} />

      {roles && members
        ? <MembersTable
            members={members as GroupMember[]}
            canEditGroupMembers={canEditGroupMembers}
            confirmRemoveMember={confirmRemoveMember}
          />
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

const MembersTable = ({ members, canEditGroupMembers, confirmRemoveMember }: {
  members: GroupMember[],
  canEditGroupMembers: boolean,
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
          {canEditGroupMembers &&
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
            {canEditGroupMembers &&
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
