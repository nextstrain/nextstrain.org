"use client";

import React, { useContext, useState } from "react";

import { InternalError } from "../error-boundary";

import { SetModalResourceContext } from "./modal";

import { Resource } from "./types";

import styles from "./group-and-resource-links.module.css";

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
      e.preventDefault(); // child elements (e.g. <a>) shouldn't receive the click
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
