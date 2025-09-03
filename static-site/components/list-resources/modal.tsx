"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { MdClose } from "react-icons/md";

import { InternalError } from "../error-boundary";

import { Resource, Group } from "./types";

import styles from "./modal.module.css";

/**
 * A light gray color — in a variable because it used both in a
 * dynamic style in this file and is passed to a function from a
 * different file.
 */
export const lightGrey = "rgba(0,0,0,0.1)";

/**
 * A React Context object that is used to pass around the state setter
 * that controls the resource loaded by the `<ResourceModal>` React
 * Component (which see)
 */
export const SetModalDataContext = createContext<React.Dispatch<
  React.SetStateAction<Resource | Group | null>
> | null>(null);

/**
 * A React Client Component that displays a provided `resource` in
 * a modal popover window.
 */
export function Modal({
  children
}: {
  children: ReactNode
}): React.ReactElement {
  const setModalData = useContext(SetModalDataContext);
  if (!setModalData) {
    throw new InternalError("Context not provided!");
  }
  const dismissModal: () => void = useCallback(() => {
    setModalData(null);
  }, [setModalData]);

  useEffect(() => {
    function _handleEsc(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        dismissModal();
      }
    }
    window.addEventListener("keydown", _handleEsc);

    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return (): void => {
      window.removeEventListener("keydown", _handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [dismissModal]);

  return (
    <div>
      <div
        className={styles.background}
        style={{ backgroundColor: `${lightGrey}` }}
        onClick={dismissModal}
      />
      <div
        className={styles.modalContainer}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
          e.stopPropagation();
        }}
      >
        <CloseIcon onClick={dismissModal} />
        {children}
      </div>
    </div>
  );
}

/**
 * A React Client Component that displays a close icon in the
 * <ResourceModal> component.
 */
function CloseIcon({
  onClick,
}: {
  /** the callback to run when the icon is clicked; ideally should close the modal */
  onClick: () => void;
}): React.ReactElement {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={styles.closeIconWrapper}
      onClick={onClick}
      onMouseOut={(): void => setHovered(false)}
      onMouseOver={(): void => setHovered(true)}
    >
      <MdClose size="1.5em" color={hovered ? "#333" : "#999"} />
    </div>
  );
}
