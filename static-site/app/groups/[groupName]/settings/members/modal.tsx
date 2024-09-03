import React, { useState } from "react";
import Modal from "../../../../../src/components/modal";
import { BigSpacer } from "../../../../../src/layouts/generalComponents";
import * as splashStyles from "../../../../../src/components/splash/styles";
import { InputButton } from "../../../../../src/components/Groups/styles";
import { RemoveMemberModalProps } from "./types";
import { removeMember } from "./page";

export const RemoveMemberModal = ({ groupName, member, isOpen, onClose}: RemoveMemberModalProps) => {
    const [statusText, setStatusText] = useState<string>("");
    const [hideConfirmationButton, setHideConfirmationButton] = useState<boolean>(false);

    async function onClickConfirm() {
      // TODO: Check that the user being removed is not the sole owner of the Group!
      // If the sole owner of a Group is trying to remove themselves, they should promote someone else to owner before
      // removing themselves OR they should email hello@nextstrain.org to remove the Group completely.
      setHideConfirmationButton(true);
      setStatusText(`Removing ${member.username}...`);
      await removeMember(member);
      setStatusText("");
      setHideConfirmationButton(false);
      onClose();
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
