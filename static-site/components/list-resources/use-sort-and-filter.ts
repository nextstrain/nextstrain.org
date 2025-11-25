"use client";

import { useMemo } from "react";

import {
  convertVersionedGroup,
  FilterOption,
  Group,
  Resource,
  SortMethod,
  VersionedGroup,
} from "./types";

/**
 * `useSortAndFilter` takes a `sortMethod` (which currently must be
 * either `"lastUpdated"` or `"alphabetical"` in order for the function
 * call to have any impact), and then uses the provided
 * `selectedFilterOptions` to sort a copy of the provided
 * `originalData`, which is then propagated back to the calling code
 * via the provided `setState` callback.
 *
 * N.b., this code runs in a React Client Component context (i.e., not
 * server side, but during the client-side hydration phase)
 */
export default function useSortAndFilter(
  /** either "lastUpdated" or "alphabetical" */
  sortMethod: SortMethod,

  /** a list of `FilterOption` values */
  selectedFilterOptions: readonly FilterOption[],

  /** a setter for a React State */
  setState: React.Dispatch<React.SetStateAction<Group[] | undefined>>,

  /** a list of Group objects */
  originalData?: Group[],
): void {
  useMemo(() => {
    if (!originalData) {
      return;
    }

    // Following console log is really useful for development
    // console.log(`useSortAndFilter() sortMethod "${sortMethod}" ` + (selectedFilterOptions.length ? `filtering to ${selectedFilterOptions.map((el) => el.value).join(", ")}` : '(no filtering)'))

    const searchValues = selectedFilterOptions.map((o) => o.value);

    function _filterResources(resource: Resource): boolean {
      return searchValues.length === 0
        ? true
        : searchValues
            .map((searchString) => resource.nameParts.includes(searchString))
            .every((x) => x);
    }

    function sortAndFilter<T extends Group>(
      groups: T[],
      sortGroups: (a: T, b: T) => number,
      sortResources: (a: Resource, b: Resource) => number,
    ): T[] {
      return groups
        .map((group) => ({
          ...group,
          resources: group.resources
            .filter(_filterResources)
            .sort(sortResources),
        }))
        .filter((group) => !!group.resources.length)
        .sort(sortGroups);
    }

    if (sortMethod === "lastUpdated") {
      const groups = originalData.map((group: Group) =>
        convertVersionedGroup(group),
      );
      const _sortGroups = (
        groupA: VersionedGroup,
        groupB: VersionedGroup,
      ): 0 | 1 | -1 => _newestFirstSort(groupA.lastUpdated, groupB.lastUpdated);
      const _sortResources = (a: Resource, b: Resource): 0 | 1 | -1 => {
        if (
          !a.lastUpdated ||
          !b.lastUpdated ||
          a.lastUpdated === b.lastUpdated
        ) {
          // resources updated on the same day or without a last updated date
          // sort alphabetically
          return _lexicographicSort(a.name, b.name);
        } else {
          return _newestFirstSort(a.lastUpdated, b.lastUpdated);
        }
      };
      const resourceGroups = sortAndFilter(groups, _sortGroups, _sortResources);
      setState(resourceGroups);
    } else if (sortMethod === "alphabetical") {
      const groups = originalData;
      const _sortGroups = (groupA: Group, groupB: Group) =>
        _lexicographicSort(
          groupA.groupName.toLowerCase(),
          groupB.groupName.toLowerCase(),
        );
      const _sortResources = (a: Resource, b: Resource) =>
        _lexicographicSort(a.name, b.name);
      const resourceGroups = sortAndFilter(groups, _sortGroups, _sortResources);
      setState(resourceGroups);
    }
  }, [sortMethod, selectedFilterOptions, originalData, setState]);
}

/**
 * Helper function to sort strings alphabetically. If provided with
 * YYYY-MM-DD strings this is the same as a chronological sort (oldest
 * to newest)
 */
function _lexicographicSort(a: string, b: string): 1 | -1 | 0 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Helper function to sort YYYY-MM-DD strings chronologically with
 * newer dates first (which is equivalent to reverse lexigraphic sort)
 */
function _newestFirstSort(a: string, b: string): 1 | -1 | 0 {
  return a < b ? 1 : a > b ? -1 : 0;
}
