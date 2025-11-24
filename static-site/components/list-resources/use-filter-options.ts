"use client";

import { useMemo, useState } from "react";
import { FilterOption, Group } from "./types";

/**
 * Utility function that takes a provided `word` and returns a
 *  `FilterOption` object based on the provided string.
 */
export function createFilterOption(
  /** the string to make into a `FilterOption` */
  word: string,
): FilterOption {
  return { label: word, value: word };
}

/**
 * React hook that recomputes the available search/filtering options
 * (i.e. those shown in the dropdown) according to the datasets that
 * are currently displayed.
 *
 * For example, if you've previously filtered by "flu", then the
 * updated set of available filtering options should only consider
 * keywords in flu datasets.
 *
 * We use counts to order the options (as this recomputes each time we
 * apply a filter) but we don't include the count in the label because
 * the React select component doesn't update already-set options and
 * thus we get out-of-sync.
 */
export function useFilterOptions(
  /** the list of groups to create filter options from */
  resourceGroups?: Group[],
): FilterOption[] {
  const [state, setState] = useState<FilterOption[]>([]);

  useMemo((): void => {
    if (resourceGroups === undefined) return;

    const counts: { [key: string]: number } = {};

    const increment = (key: string) => {
      if (!counts[key]) counts[key] = 0;
      counts[key]++;
    };

    let nResources = 0; // Number of individual resources displayed
    for (const group of resourceGroups) {
      for (const resource of group.resources) {
        nResources++;
        resource.nameParts.forEach(increment); /* includes groupName */
      }
    }

    const options = Object.entries(counts)
      // filter out search options present in every displayed resource
      .filter(([_, count]) => count !== nResources) // eslint-disable-line @typescript-eslint/no-unused-vars
      .sort((a, b) => (a[1] < b[1] ? 1 : -1))
      .map(([word]) => createFilterOption(word));

    setState(options);
  }, [resourceGroups]);

  return state;
}
