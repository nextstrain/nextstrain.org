"use client";

import React, { useContext, useState } from "react";

import { InternalError } from "../error-boundary";

import { SetModalResourceContext } from "./modal";

import { Resource } from "./types";

import styles from "./group-and-resource-links.module.css";

/**
 * A React Client Component that displays a link to a group resource,
 * with proper styling, with attributes to force the link open in a
 * new window/tab and without sending referrer information.
 *
 * @param displayName - the text to use for the link
 * @param href - the `href` property for the <a> element
 */
export function GroupLink({
  displayName,
  href,
}: {
  displayName: string;
  href: string;
}): React.ReactElement {
  return (
    <a
      className={`${styles.baseLink} ${styles.groupLink}`}
      href={href}
      rel="noreferrer"
      target="_blank"
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
 *
 * @param displayName - the text to use for the link
 * @param href - the `href` property for the <a> element
 * @param resource - the resource to display in a modal on a shift-click
 */
export function IndividualQuickLink({
  displayName,
  href,
  resource,
}: {
  displayName: string;
  href: string;
  resource: Resource | undefined;
}): React.ReactElement | null {
  const setModalResource = useContext(SetModalResourceContext);
  if (!setModalResource) {
    throw new InternalError("Context not provided!");
  }

  if (!resource) {
    return null;
  }

  function onClick(e: React.MouseEvent): void {
    if (e.shiftKey) {
      setModalResource && setModalResource(resource);
      // child elements (e.g. <a>) shouldn't receive the click
      e.preventDefault();
    }
  }

  return (
    <div onClick={onClick}>
      <a
        className={`${styles.baseLink} ${styles.resourceLink}`}
        href={href}
        rel="noreferrer"
        target="_blank"
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
 *
 * @param resource - the resource to display in a modal on a shift-click
 * @param topOfColumn - whether the resource is at the top of a column
 * when displayed; items at the top of a column act like they're being
 * hovered all the time
 */
export function IndividualResourceLink({
  resource,
  topOfColumn,
}: {
  resource: Resource;
  topOfColumn: boolean;
}): React.ReactElement | null {
  const setModalResource = useContext(SetModalResourceContext);
  if (!setModalResource) {
    throw new InternalError("Context not provided!");
  }

  const [hovered, setHovered] = useState(false);

  function onClick(e: React.MouseEvent): void {
    if (e.shiftKey) {
      setModalResource && setModalResource(resource);
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
        rel="noreferrer"
        target="_blank"
      >
        {"• "}
        {hovered || topOfColumn
          ? resource.displayName.hovered
          : resource.displayName.default}
      </a>
    </div>
  );
}
