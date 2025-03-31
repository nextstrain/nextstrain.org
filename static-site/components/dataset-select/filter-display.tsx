/**
 * Code and components related to Filtering.
 * Most code and logic was originally lifted from Auspice
 */
import React from "react";

import { sum } from "lodash";
import { FaRegEye, FaRegEyeSlash, FaTrash } from "react-icons/fa";

import CenteredContainer from "../../components/centered-container";

import StyledTooltip from "./styled-tooltip";
import {
  ApplyFilterType,
  FilterCategoryType,
  FilterType,
  SingleFilterType,
} from "./types";

import styles from "./filter-display.module.css";

/**
 * React Server Component for the badges displayed when a filter is selected
 */
export default function FilterDisplay({
  filters,
  applyFilter,
}: {
  /** the type of filter */
  filters: FilterType;

  /** helper for filter application */
  applyFilter: ApplyFilterType;
}): React.ReactElement {
  const filtersByCategory: FilterCategoryType[] = groupFiltersByCategory(
    filters,
    applyFilter,
  );

  if (
    !filtersByCategory.length ||
    !sum(filtersByCategory.map((c) => c.badges.length))
  ) {
    return <></>;
  }

  return (
    <CenteredContainer>
      {"Filtered to "}
      {filtersByCategory.map((filterCategory, idx) => {
        const multipleFilterBadges = filterCategory.badges.length > 1;
        const previousCategoriesRendered = idx !== 0;

        return (
          <span
            style={{ fontSize: "2rem", padding: "0px 2px" }}
            key={filterCategory.name}
          >
            {previousCategoriesRendered && <Intersect id={"intersect" + idx} />}
            {multipleFilterBadges && openBracketBig}{" "}
            {/* multiple badges => surround with set notation */}
            {filterCategory.badges.map(
              (
                badge: React.ReactElement | React.ReactElement[],
                badgeIdx: number,
              ) => {
                if (Array.isArray(badge)) {
                  // if `badge` is an array then we wish to render a set-within-a-set
                  return (
                    <span
                      key={badge
                        .map((b: React.ReactElement) => b.props.id)
                        .join("")}
                    >
                      {openBracketSmall}

                      {badge.map((el: React.ReactElement, elIdx: number) => (
                        <span key={el.props.id}>
                          {el}
                          {elIdx !== badge.length - 1 && Union}
                        </span>
                      ))}

                      {closeBracketSmall}

                      {badgeIdx !== filterCategory.badges.length - 1 && ", "}
                    </span>
                  );
                } else {
                  return (
                    <span key={badge.props.id}>
                      {badge}
                      {badgeIdx !== filterCategory.badges.length - 1 && ", "}
                    </span>
                  );
                }
              },
            )}
            {multipleFilterBadges && closeBracketBig}
          </span>
        );
      })}
      {". "}
    </CenteredContainer>
  );
}

/** Component to indicate intersecting filters */
function Intersect({
  id,
}: {
  /** unique ID for tooltip mapping */
  id: string;
}): React.ReactElement {
  return (
    <span
      style={{
        fontSize: "2rem",
        fontWeight: 300,
        padding: "0px 4px 0px 2px",
        cursor: "help",
      }}
      data-tip
      data-for={id}
    >
      ∩
      <FilterBadgeTooltip
        id={id}
      >{`Groups of filters are combined by intersection`}</FilterBadgeTooltip>
    </span>
  );
}

/** Component to indicate union filter operation */
const Union = (
  <span style={{ fontSize: "1.5rem", padding: "0px 3px 0px 2px" }}>∪</span>
);

/** Component to display a large left curly */
const openBracketBig = (
  <span
    style={{ fontSize: "2rem", fontWeight: 300, padding: "0px 0px 0px 2px" }}
  >
    {"{"}
  </span>
);

/** Component to display a large right curly */
const closeBracketBig = (
  <span style={{ fontSize: "2rem", fontWeight: 300, padding: "0px 2px" }}>
    {"}"}
  </span>
);

/** Component to display a small left curly */
const openBracketSmall = (
  <span style={{ fontSize: "1.8rem", fontWeight: 300, padding: "0px 2px" }}>
    {"{"}
  </span>
);

/** Component to display a small right curly */
const closeBracketSmall = (
  <span style={{ fontSize: "1.8rem", fontWeight: 300, padding: "0px 2px" }}>
    {"}"}
  </span>
);

/** Helper to group different available filters by category */
function groupFiltersByCategory(
  /** The filters to operate on */
  filters: FilterType,

  /** Helper application function to associate with categorized filters */
  applyFilter: ApplyFilterType,
): FilterCategoryType[] {
  const filtersByCategory: FilterCategoryType[] = [];

  Reflect.ownKeys(filters)
    .filter((filterName) => [filterName].length > 0)
    .forEach((filterName) => {
      filtersByCategory.push({
        name: String(filterName),
        badges: createFilterBadges(filters, String(filterName), applyFilter),
      });
    });

  return filtersByCategory;
}

/** Helper function to create a collection of badges for a set of filters */
function createFilterBadges(
  /** Filters to operate on */
  filters: FilterType,

  /** Name of filter */
  filterName: string,

  /** Helper filter application function */
  applyFilter: ApplyFilterType,
): React.ReactElement[] {
  const nFilterValues = filters[filterName]?.length;

  const onHoverMessage =
    nFilterValues === 1
      ? `Filtering datasets to this ${filterName}`
      : `Filtering datasets to these ${nFilterValues} ${filterName}`;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return filters[filterName]!.sort((a, b) =>
    a.value < b.value ? -1 : a.value > b.value ? 1 : 0,
  ).map((item) => {
    const label = `${item.value}`;

    return createIndividualBadge({
      filterName,
      item,
      label,
      onHoverMessage,
      applyFilter,
    });
  });
}

/** Helper function to create a single <FilterBadge> component */
function createIndividualBadge({
  filterName,
  item,
  label,
  onHoverMessage,
  applyFilter,
}: {
  /** The name of the filter */
  filterName: string;

  /** The filter item itself */
  item: SingleFilterType;

  /** Label for the filter */
  label: string;

  /** Tooltip message for the filter */
  onHoverMessage: string;

  /** Helper function to apply the filter */
  applyFilter: ApplyFilterType;
}): React.ReactElement {
  return (
    <FilterBadge
      key={item.value}
      id={String(item.value)}
      active={item.active}
      canMakeInactive
      onHoverMessage={onHoverMessage}
      activate={() => {
        applyFilter("add", filterName, [item.value]);
      }}
      inactivate={() => {
        applyFilter("inactivate", filterName, [item.value]);
      }}
      remove={() => {
        applyFilter("remove", filterName, [item.value]);
      }}
    >
      {label}
    </FilterBadge>
  );
}

/**
 * React component to display a selected filter with associated
 * icons to remove filter. More functionality to be added!
 */
function FilterBadge({
  activate,
  active,
  canMakeInactive,
  children,
  id,
  inactivate,
  onHoverMessage = "The visible data is being filtered by this",
  remove,
}: {
  /** Helper function to activate the filter */
  activate: () => void;

  /** Is the filter active? */
  active: boolean;

  /** Can we inactivate the filter? */
  canMakeInactive: boolean;

  /** Content wrapped by the badge */
  children: React.ReactNode;

  /** Unique ID */
  id: string;

  /** Inactivation helper function */
  inactivate: () => void;

  /** Tooltip */
  onHoverMessage: string;

  /** Helper function to turn the filter off */
  remove: () => void;
}): React.ReactElement {
  const badgeStyle =
    canMakeInactive && !active
      ? {
          background:
            "repeating-linear-gradient(135deg, #E9F2F6, #E9F2F6 5px, transparent 5px, transparent 10px)",
        }
      : {};

  return (
    <div className={styles.badgeContainer} style={badgeStyle}>
      <div
        className={`${styles.textContainer} ${styles.baseContainer}`}
        data-tip
        data-for={id}
      >
        {children}
      </div>
      <FilterBadgeTooltip id={id}>
        {canMakeInactive && !active
          ? `This filter is currently inactive`
          : onHoverMessage}
      </FilterBadgeTooltip>
      {canMakeInactive && (
        <div
          className={styles.iconContainer}
          onClick={active ? inactivate : activate}
          role="button"
          tabIndex={0}
          data-tip
          data-for={id + "active"}
        >
          {active ? <FaRegEye /> : <FaRegEyeSlash />}
          <FilterBadgeTooltip id={id + "active"}>
            {active ? "Inactivate this filter" : "Re-activate this filter"}
          </FilterBadgeTooltip>
        </div>
      )}
      <div
        className={styles.iconContainer}
        onClick={remove}
        role="button"
        tabIndex={0}
      >
        <FaTrash data-tip data-for={id + "remove"} />
        <FilterBadgeTooltip id={id + "remove"}>
          {"Remove this filter"}
        </FilterBadgeTooltip>
      </div>
    </div>
  );
}

/** Tooltip associated with a single <FilterBadge> */
function FilterBadgeTooltip({
  id,
  children,
}: {
  /** unique ID */
  id: string;

  /** Tooltip content */
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <StyledTooltip place="bottom" delayShow={300} id={id}>
      {children}
    </StyledTooltip>
  );
}
