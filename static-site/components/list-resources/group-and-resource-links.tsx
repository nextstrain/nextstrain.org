"use client";

import React, { useContext, useState } from "react";

import { InternalError } from "../error-boundary";

import { SetModalResourceContext } from "./modal";

import { Resource } from "./types";

import styles from "./group-and-resource-links.module.css";

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

export function IndividualQuickLink({
  displayName,
  href,
  resource,
}: {
  displayName: string;
  href: string;
  resource: Resource | undefined;
}): React.ReactElement | null {
  if (!resource) {
    return null;
  }

  const setModalResource = useContext(SetModalResourceContext);
  if (!setModalResource) {
    throw new InternalError("Context not provided!");
  }

  function onClick(): void {
    setModalResource && setModalResource(resource);
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

export function IndividualResourceLink({
  resource,
  topOfColumn,
}: {
  resource: Resource;
  topOfColumn: boolean;
}): React.ReactElement | null {
  // we already checked for this in the caller (probably?) but this pacifies the typechecker
  if (!resource.displayName) {
    return null;
  }

  const setModalResource = useContext(SetModalResourceContext);
  if (!setModalResource) {
    throw new InternalError("Context not provided!");
  }

  const [hovered, setHovered] = useState(false);

  function onClick(e: React.MouseEvent): void {
    if (e.shiftKey) {
      setModalResource && setModalResource(resource);
      e.preventDefault(); // child elements (e.g. <a>) shouldn't receive the click
    }
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
