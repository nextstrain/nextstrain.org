'use client'
import React, { useState } from "react";
import Select, { MultiValue } from 'react-select';
import styled from "styled-components";
import { startCase } from "lodash"
import { uri } from "../../../../../../src/templateLiterals";
import GenericPage from "../../../../../src/layouts/generic-page.jsx";
import { theme } from "../../../../../src/layouts/theme";
import { BigSpacer, CenteredContainer, FlexGridRight, MediumSpacer } from "../../../../../src/layouts/generalComponents";
import * as splashStyles from "../../../../../src/components/splash/styles";
import { ErrorBanner } from "../../../../../src/components/errorMessages";
import { RemoveMemberModal } from "./modal";
import { GroupMember, ErrorMessage, RemoveMemberModalProps, SelectOption } from "./types";
import { updateMemberRoles } from "./page";

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
            groupName={groupName}
            roles={roles}
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

const RolesSelectStyles = {
  container: (styles) => ({
    ...styles,
    display: "flex",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    fontSize: theme.niceFontSize,
  }),
}

const MembersTable = ({ groupName, roles, members, canEditGroupMembers, confirmRemoveMember }: {
  groupName: string,
  roles: string[],
  members: GroupMember[],
  canEditGroupMembers: boolean,
  confirmRemoveMember: (member: GroupMember) => void,
}) => {
  const sortedMembers = members.toSorted((a, b) => a.username.localeCompare(b.username));
  // Prettify the role names by making them singular and capitalized
  const roleNameMap = new Map(roles.map((role) => {
    return [role, startCase(role.replace(/s$/, ''))]
  }));
  // Convert role names into options for the Select dropdown
  const roleOptions = Array.from(roleNameMap, ([roleName, prettyRoleName]) => ({ value: roleName, label: prettyRoleName}));
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

    updateMemberRoles(member, rolesToRemove, rolesToAdd);
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
            {canEditGroupMembers
              ? <div className="col d-flex justify-content-center">
                  <Select
                    isMulti
                    styles={RolesSelectStyles}
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
