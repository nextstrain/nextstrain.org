"use client";

import React, { useState, useContext } from "react";

import { MdChevronRight } from "react-icons/md";

import { InternalError } from "../error-boundary";

import IconContainer from "./icon-container";
import { IndividualResource } from "./individual-resource";
import { GroupLink, IndividualQuickLink } from "./group-and-resource-links";
import { SetModalDataContext } from "./modal";
import TooltipWrapper from "./tooltip-wrapper";

import { DisplayNamedResource, Group, QuickLink, Resource, ResourceType } from "./types";

import styles from "./resource-group.module.css";

/** React Client Component for displaying a group of related Resource objects. */
export default function ResourceGroup({
  group,
  elWidth,
  resourceType,
  numGroups,
  sortMethod,
  quickLinks,
}: {
  /** `Group` object representing the resources to display */
  group: Group;

  /** the width of the element displaying the resources */
  elWidth: number;

  /** Resource type modifies the language used to describe resources */
  resourceType: ResourceType;

  /** overall count of `Group` objects being displayed */
  numGroups: number;

  /** React State holding the active sorting method */
  sortMethod: string;

  /** an optional list of `QuickLink` objects for the group */
  quickLinks?: QuickLink[];
}): React.ReactElement {
  const { collapseThreshold, resourcesToShowWhenCollapsed } =
    _collapseThresholds(numGroups);
  const collapsible = group.resources.length > collapseThreshold;
  const [isCollapsed, setCollapsed] = useState(collapsible); // if it is collapsible, start collapsed

  const resources = isCollapsed
    ? group.resources.slice(0, resourcesToShowWhenCollapsed)
    : group.resources;

  const displayResources = _addDisplayName(resources);

  /* isMobile: boolean determines whether we expose snapshots, as we hide them on small screens */
  const isMobile = elWidth < 500;

  const { maxResourceWidth, gapWidth } = _getMaxResourceWidth(displayResources);

  return (
    <div className={styles.resourceGroupContainer}>
      <ResourceGroupHeader
        resourceType={resourceType}
        group={group}
        quickLinks={quickLinks}
        setCollapsed={setCollapsed}
        collapsible={collapsible}
        isCollapsed={isCollapsed}
        resourcesToShowWhenCollapsed={resourcesToShowWhenCollapsed}
        isMobile={isMobile}
      />
      <div
        className={styles.individualResourceContainer}
        style={{ columnWidth: `${maxResourceWidth}px` }}
      >
        {/* what to do when there's only one tile in a group? */}
        {displayResources.map((d) => (
          // We use key changes to re-render the component & thus recompute the DOM position
          <IndividualResource
            gapWidth={gapWidth}
            key={`${d.name}_${isCollapsed}_${elWidth}_${sortMethod}`}
            isMobile={isMobile}
            resource={d}
          />
        ))}
      </div>
    </div>
  );
}

/** A React Client Component for the header above a <ResourceGroup> */
function ResourceGroupHeader({
  group,
  isMobile,
  resourceType,
  setCollapsed,
  collapsible,
  isCollapsed,
  resourcesToShowWhenCollapsed,
  quickLinks,
}: {
  /** the `ResourceGroup` being displayed */
  group: Group;

  /** boolean for whether we're on a mobile sized screen */
  isMobile: boolean;

  /** Resource type modifies the language used to describe resources */
  resourceType: ResourceType;
  
  /** a React State setter for the collapsed state */
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  /** boolean for whether the header is collapsible */
  collapsible: boolean;

  /** boolean for whether the header is _collapsed_ */
  isCollapsed: boolean;

  /** count of resources to show in the collapsed state, */
  resourcesToShowWhenCollapsed: number;

  /** optional list of `QuickLink` objects to display */
  quickLinks?: QuickLink[];
}): React.ReactElement {
  const setModalData = useContext(SetModalDataContext);
  if (!setModalData) {
    throw new InternalError("Context not provided!");
  }

  /* Filter the known quick links to those which appear in resources of this group */
  const resourcesByName = Object.fromEntries(
    group.resources.map((r) => [r.name, r]),
  );
  const quickLinksToDisplay = (quickLinks || []).filter(
    (ql) => !!resourcesByName[ql.name] || ql.groupName === group.groupName,
  );

  const rotateDeg = isCollapsed ? "0" : "90";

  return (
    <div className={styles.headerContainer}>
      {group.groupImgSrc && (
        <img alt={group.groupImgAlt} height="35px" src={group.groupImgSrc} />
      )}

      <div className={styles.flexColumnContainer}>
        <div className={styles.headerRow}>
          {group.groupUrl ? (
            <TooltipWrapper
              description={group.groupUrlTooltip}
            >
              <GroupLink
                displayName={group.groupDisplayName || group.groupName}
                href={group.groupUrl}
              />
            </TooltipWrapper>
          ) : (
            <span className={styles.unlinkedGroupName}>
              {group.groupDisplayName || group.groupName}
            </span>
          )}
          {/* Currently we hide the byline on mobile, but we could render it as a separate row */}
          {!isMobile && (
            <TooltipWrapper
              description={
                `The most recently updated datasets in this group were last updated on ${group.lastUpdated}` +
                "<br/>(however there may have been a more recent update since we indexed the data)"
              }
            >
              <span>
                {group.lastUpdated &&
                  `Most recent snapshot: ${group.lastUpdated}`}
              </span>
            </TooltipWrapper>
          )}
          {resourceType==='intermediate' && Object.hasOwn(group, 'fetchHistory') && (
            <span className={styles.clickableSpan} onClick={() => {setModalData(group)}}>
              Show full history
            </span>
          )}
          <span className={styles.flexSpan} />
          <TooltipWrapper
            description={`There are ${group.nResources} ${resourceType==='dataset' ? 'datasets' : 'files'} in this group`}
          >
            <IconContainer
              color={"rgb(79, 75, 80)"}
              iconName="bullet-list"
              text={`${group.nResources}`}
            />
          </TooltipWrapper>
          {group.nVersions && !isMobile && (
            <TooltipWrapper
              description={`${group.nVersions} snapshots exist across the ${group.nResources} ${resourceType==='dataset' ? 'datasets' : 'files'} in this group`}
            >
              <IconContainer
                iconName="history"
                color={"rgb(79, 75, 80)"}
                text={`${group.nVersions}`}
              />
            </TooltipWrapper>
          )}
        </div>

        {!!quickLinksToDisplay.length && (
          <div className={`${styles.headerRow} ${styles.quickLinkRow}`}>
            {!isMobile && (
              <TooltipWrapper
                description={
                  "Quick links are a hand-curated selection of datasets in this group"
                }
              >
                Quick links:
              </TooltipWrapper>
            )}
            {quickLinksToDisplay.map((ql) => (
              <div className={styles.quickLinkWrapper} key={ql.name}>
                <IndividualQuickLink
                  displayName={ql.display}
                  href={`/${ql.name}`}
                  resource={resourcesByName[ql.name]}
                />
              </div>
            ))}
          </div>
        )}

        {collapsible && (
          <div
            className={styles.clickable}
            onClick={() => setCollapsed(!isCollapsed)}
          >
            <div className={styles.collapsibleRow}>
              <div
                className={styles.rotate}
                style={{ rotate: `${rotateDeg}deg` }}
              >
                <MdChevronRight size="30px" />
              </div>
              {isCollapsed ? (
                <TooltipWrapper
                  description={`For brevity we're only showing a subset of ${group.groupName} resources - click to show them all`}
                >
                  {` show ${group.resources.length - resourcesToShowWhenCollapsed} more datasets`}
                </TooltipWrapper>
              ) : (
                " collapse datasets"
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to add the `displayName` property to a provided
 * list of `Resource` objects.
 *
 * Given successive nameParts:
 *     [ seasonal-flu, h1n1pdm]
 *     [ seasonal-flu, h3n2]
 *
 * We want to produce two names: a default name, which contains all
 * parts, and a displayName which hides the fields that match the
 * preceding name. This allows for a UI to display them in a tree-like
 * manner such as:
 *
 *     "seasonal-flu | h1n1pdm"
 *     "             | h3n2"
 */
function _addDisplayName(
  /** the list of `Resource` objects to operate on */
  resources: Resource[],
): DisplayNamedResource[] {
  const sep = "│"; // ASCII 179

  return resources.map((r, i) => {
    let name: string;
    if (i === 0) {
      name = r.nameParts.join(sep);
    } else {
      const previousResource = resources[i - 1];

      if (previousResource === undefined) {
        throw new InternalError(
          "Previous resource is undefined. Check that this is not run on i===0.",
        );
      }

      let matchIdx = r.nameParts
        .map((word, j) => word === previousResource.nameParts[j])
        .findIndex((v) => !v);

      if (matchIdx === -1) {
        // -1 means every word is in the preceding name, but we should display the last word anyway
        matchIdx = r.nameParts.length - 2;
      }

      name = r.nameParts
        .map((word, j) => (j < matchIdx ? " ".repeat(word.length) : word))
        .join(sep);
    }

    return {
      ...r,
      displayName: { hovered: r.nameParts.join(sep), default: name },
    };
  });
}

/**
 * A helper function to calculate the collapse threshold and number of
 * groups to display when collapsed, based on the number of total
 * groups.
 */
function _collapseThresholds(
  /** the total number of `Group` objects in play */
  numGroups: number,
): {
  collapseThreshold: number;
  resourcesToShowWhenCollapsed: number;
} {
  // The collapse thresholds are determined by the total number of
  // groups displayed

  // if there are more than this many resources then we can collapse */
  let collapseThreshold = 12;

  // when collapsed, show this many resources
  let resourcesToShowWhenCollapsed = 8;

  if (numGroups === 1) {
    // essentially show them all
    collapseThreshold = 100;
    resourcesToShowWhenCollapsed = 100;
  } else if (numGroups === 2) {
    collapseThreshold = 50;
    resourcesToShowWhenCollapsed = 40;
  }

  return { collapseThreshold, resourcesToShowWhenCollapsed };
}

/**
 * Helper function to calculate the width between resources and the
 * max width of a single resource, based on the provided list of
 * `DisplayNamedResource` objects.
 */
function _getMaxResourceWidth(
  /** the list of `DisplayNamedResource` objects in play */
  displayResources: DisplayNamedResource[],
): {
  gapWidth: number;
  maxResourceWidth: number;
} {
  // These variables allow calculation of the width of <IndividualResource>,
  // which we use for the column layout so that every <IndividualResource>
  // is nicely aligned. There are other ways (e.g. querying the DOM)
  // but this is simpler and seems to be working well.
  const iconWidth = 20; // not including text
  const gapWidth = 10;
  const namePxPerChar = 10;
  const summaryPxPerChar = 9;

  const maxResourceWidth = displayResources.reduce(
    (w: number, r: DisplayNamedResource): number => {
      /* add the pixels for the display name */
      let _w = r.displayName.default.length * namePxPerChar;
      if (r.outOfDateWarning) {
        _w += 40; // icon + padding
      } else if (r.nVersions && r.updateCadence) {
        _w += gapWidth + iconWidth;
        _w +=
          ((r.updateCadence.summary.length || 0) +
            5 +
            String(r.nVersions).length) *
          summaryPxPerChar;
      }
      return _w > w ? _w : w;
    },
    200,
  ); // 200 (pixels) is the minimum

  return { gapWidth, maxResourceWidth };
}
