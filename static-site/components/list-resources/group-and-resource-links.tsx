"use client";

import React, { useContext, useState } from "react";

import { InternalError } from "../error-boundary";

import { SetModalDataContext } from "./modal";

import { Resource } from "./types";

import styles from "./group-and-resource-links.module.css";

/**
 * A React Client Component that displays a link to a group resource,
 * with proper styling, with attributes to force the link open in a
 * new window/tab and without sending referrer information.
 */
export function GroupLink({
  displayName,
  href,
}: {
  /** the text to use for the link */
  displayName: string;

  /** the `href` property for the <a> element */
  href: string;
}): React.ReactElement {
  return (
    <a
      className={`${styles.baseLink} ${styles.groupLink}`}
      href={href}
    >
      {displayName}
    </a>
  );
}

/**
 * A React Client Component that displays a link that opens a quick link,
 * with proper styling, with attributes to force the link open in a
 * new window/tab and without sending referrer information. Adds an
 * `onClick` handler to the `<div>` wrapping the link, so that a shift
 * click opens a modal with a timeline display of the resource.
 */
export function IndividualQuickLink({
  displayName,
  href,
  resource,
}: {
  /** the text to use for the link */
  displayName: string;

  /** the `href` property for the <a> element */
  href: string;

  /** the resource to display in a modal on a shift-click */
  resource: Resource | undefined;
}): React.ReactElement | null {
  const setModalResource = useContext(SetModalDataContext);
  if (!setModalResource) {
    throw new InternalError("Context not provided!");
  }

  if (!resource) {
    return null;
  }

  /** Helper function for handling shift-click events */
  function onClick(e: React.MouseEvent): void {
    if (e.shiftKey) {
      resource && setModalResource && setModalResource(resource);
      // child elements (e.g. <a>) shouldn't receive the click
      e.preventDefault();
    }
  }

  return (
    <div onClick={onClick}>
      <a
        className={`${styles.baseLink} ${styles.resourceLink}`}
        href={href}
      >
        {displayName}
      </a>
    </div>
  );
}

/**
 * A React Client Component that displays a link that opens an individual
 * resource, with proper styling, with attributes to force the link
 * open in a new window/tab and without sending referrer information.
 * Adds an `onClick` handler to the `<div>` wrapping the link, so that
 * a shift click opens a modal with a timeline display of the
 * resource. Further, adds hover state handling that changes the
 * display of the resource name on mouse-over/mouse-out.
 */
export function IndividualResourceLink({
  resource,
  topOfColumn,
}: {
  /** the resource to display in a modal on a shift-click */
  resource: Resource;

  /**
   * whether the resource is at the top of a column when displayed;
   * items at the top of a column act like they're being hovered all
   * the time
   */
  topOfColumn: boolean;
}): React.ReactElement | null {
  const setModalData = useContext(SetModalDataContext);
  if (!setModalData) {
    throw new InternalError("Context not provided!");
  }

  const [hovered, setHovered] = useState(false);

  function onClick(e: React.MouseEvent): void {
    if (e.shiftKey) {
      setModalData && setModalData(resource);
      // child elements (e.g. <a>) shouldn't receive the click
      e.preventDefault();
    }
  }

  // we already checked for this in the caller (probably?) but this pacifies the typechecker
  if (!resource.displayName) {
    return null;
  }

  return (
    <div onClick={onClick}>
      <a
        className={`${styles.baseLink} ${styles.resourceLink}`}
        href={resource.url}
        onMouseOut={(): void => setHovered(false)}
        onMouseOver={(): void => setHovered(true)}
      >
        {"• "}
        {hovered || topOfColumn
          ? resource.displayName.hovered
          : resource.displayName.default}
      </a>
    </div>
  );
}
