"use client";

import React, { useContext, useEffect, useRef, useState } from "react";

import { InternalError } from "../error-boundary";

import { IndividualResourceLink } from "./group-and-resource-links";
import IconContainer from "./icon-container";
import { SetModalDataContext } from "./modal";
import TooltipWrapper from "./tooltip-wrapper";

import { Resource } from "./types";

import styles from "./individual-resource.module.css";

/**
 * React Client Component to display an individual resource as part of
 * a resource listing.
 */
export function IndividualResource({
  gapWidth,
  isMobile,
  resource,
}: {
  /** the value for the CSS `gap` property in the `<div>` containing the resource */
  gapWidth: number;

  /** boolean for whether the display is a mobile one */
  isMobile: boolean;

  /** the resource to display */
  resource: Resource;
}): React.ReactElement | null {
  const setModalData = useContext(SetModalDataContext);
  if (!setModalData) {
    throw new InternalError("Context not provided!");
  }

  const [topOfColumn, setTopOfColumn] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      ref.current === null ||
      ref.current.parentNode === null ||
      ref.current.parentNode.nodeName !== "DIV"
    ) {
      throw new InternalError(
        "ref must be defined and the parent must be a div (i.e., IndividualResourceContainer).",
      );
    }

    // The type of ref.current.parentNode is ParentNode which does not have an
    // offsetTop property. I don't think there is a way to appease the
    // TypeScript compiler other than a type assertion. It is loosely coupled
    // to the check above for parentNode.nodeName.
    // Note: this doesn't strictly have to be a div, but that's what it is in
    // current usage of the component at the time of writing.
    const parentNode = ref.current.parentNode as HTMLDivElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions

    // The column CSS is great but doesn't allow us to know if an
    // element is at the top of its column, so we resort to JS
    if (ref.current.offsetTop === parentNode.offsetTop) {
      setTopOfColumn(true);
    }
  }, []);

  // don't show anything if display name is unavailable
  if (!resource.displayName) {
    return null;
  }

  // If an out of date warning exists then show it. Otherwise show cadence information if it's available
  let history: React.JSX.Element | null = null;
  if (resource.outOfDateWarning) {
    history = (
      <TooltipWrapper description={resource.outOfDateWarning}>
        <IconContainer iconName="out-of-date" text={''}/>
      </TooltipWrapper>
    );
  } else if (
    !isMobile && // don't show cadence information on mobile
    resource.updateCadence &&
    resource.nVersions &&
    resource.lastUpdated
  ) {
    history = (
      <TooltipWrapper
        description={
          resource.updateCadence.description +
          `<br/>Last known update on ${resource.lastUpdated}` +
          `<br/>${resource.nVersions} snapshots of this dataset available (click to see them)`
        }
      >
        <IconContainer
          handleClick={() => setModalData(resource)}
          iconName="history"
          text={`${resource.updateCadence.summary} (n=${resource.nVersions})`}
        />
      </TooltipWrapper>
    );
  }

  const description = resource.lastUpdated
    ? `Last known update on ${resource.lastUpdated}`
    : "";

  return (
    <div className={styles.individualResourceContainer} ref={ref}>
      <div className={styles.flexRow} style={{ gap: `${gapWidth}px` }}>
        <TooltipWrapper description={description}>
          <IndividualResourceLink
            resource={resource}
            topOfColumn={topOfColumn}
          />
        </TooltipWrapper>

        {history}
      </div>
    </div>
  );
}
