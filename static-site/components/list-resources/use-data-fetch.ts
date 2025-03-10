"use client";

import { useState, useEffect } from "react";

import { InternalError } from "../error-boundary";

import { Group, Resource, ResourceListingInfo } from "./types";

/**
 * React Hook that uses the provided `resourceListingCallback` to
 * fetch resources and parse them into `pathVersions` and `pathPrefix`
 * values. This callback is expected (and encouraged!) to `throw()` on
 * any and all errors.
 *
 * Then continues on to parse the `pathVersions`/`pathPrefix` data
 * structures into a list of `Group` objects, each representing a
 * "pathogen" or "group", and detailing the available resources for
 * them, as well as the available versions (aka snapshots) for each of
 * those resources. In the case of un-versioned resources (i.e., where
 * the provided `versioned` boolean is false), `versions` will be an
 * empty array (i.e., `[]`).
 *
 * The current implementation applies the provided `versioned` boolean
 * to the entire API response. In the future, we may shift this
 * `versioned` status into the API response proper, to allow it to
 * vary across the returned resources.
 *
 * @param versioned - indicates whether the fetched resources are versioned
 * @param defaultGroupLinks - whether to modify the group URL to include a group
 * @param groupDisplayNames - a map used to optionally rename some resources
 * @param resourceListingCallback - the callback to fetch resource data
 */
export default function useDataFetch(
  versioned: boolean,
  defaultGroupLinks: boolean,
  groupDisplayNames: Record<string, string>,
  resourceListingCallback: () => Promise<ResourceListingInfo>,
): { groups: Group[] | undefined; dataFetchError: boolean } {
  const [groups, setGroups] = useState<Group[]>();
  const [dataFetchError, setDataFetchError] = useState<boolean>(false);

  useEffect((): void => {
    async function fetchAndParse(): Promise<void> {
      try {
        const { pathPrefix, pathVersions } = await resourceListingCallback();

        // group/partition the resources by pathogen (the first word
        // of the resource path). This grouping is constant for all UI
        // options so we do it a single time following the data fetch
        const partitions = _partitionByPathogen(
          pathVersions,
          pathPrefix,
          versioned,
        );

        setGroups(
          _groupsFrom(
            partitions,
            pathPrefix,
            defaultGroupLinks,
            groupDisplayNames,
          ),
        );
      } catch (err) {
        console.error(`Error while fetching and/or parsing data`);
        console.error(err);
        return setDataFetchError(true);
      }
    }

    fetchAndParse();
  }, [
    versioned,
    defaultGroupLinks,
    groupDisplayNames,
    resourceListingCallback,
  ]);

  return { groups, dataFetchError };
}

/**
 * Helper function to convert the provided `partitions` (an object
 * mapping group names to lists of resources) into a list of `Group`
 * objects
 *
 * @param partitions - object map of names to resources
 * @param pathPrefix - prefix to add when defaultGroupLinks param is true
 * @param defaultGroupLinks - boolean controlling conversion of groupUrl values
 * @param groupDisplayNames - map controlling rename of resource names
 */
function _groupsFrom(
  partitions: Record<string, Resource[]>,
  pathPrefix: string,
  defaultGroupLinks: boolean,
  groupDisplayNames: Record<string, string>,
): Group[] {
  return Object.entries(partitions).map(([groupName, resources]) => {
    const groupInfo: Group = {
      groupName: groupName,
      nResources: resources.length,
      nVersions:
        resources.reduce(
          (total, r) => (r.nVersions ? total + r.nVersions : total),
          0,
        ) || undefined,
      lastUpdated: resources
        .map((r) => r.lastUpdated)
        .sort()
        .at(-1),
      resources,
    };

    // add optional properties
    if (defaultGroupLinks) {
      groupInfo.groupUrl = `/${pathPrefix}${groupName}`;
    }
    if (groupDisplayNames?.[groupName]) {
      groupInfo.groupDisplayName = groupDisplayNames[groupName];
    }

    return groupInfo;
  });
}

/**
 * Helper function to group the provided `pathVersions` object
 * mapping between path and dates into an object with pathogen/group
 * names as the keys and arrays of Resource objects as the values.
 *
 * @param pathVersions - object mapping path to lists of dates
 * @param pathPrefix - prefix added to resource name to build URL
 * @param versioned - boolean controlling addition of version-specific fields
 */
function _partitionByPathogen(
  pathVersions: Record<string, string[]>,
  pathPrefix: string,
  versioned: boolean,
): Record<string, Resource[]> {
  return Object.entries(pathVersions).reduce(
    (store: Record<string, Resource[]>, [name, dates]) => {
      const nameParts = name.split("/");

      if (nameParts[0] === undefined) {
        throw new InternalError(`Name is not properly formatted: '${name}'`);
      }

      const groupName = nameParts[0];

      const resourceDetails: Resource = {
        name,
        groupName, // decoupled from nameParts
        nameParts,
        sortingName: _sortableName(nameParts),
        url: `/${pathPrefix}${name}`,
      };

      if (versioned) {
        const sortedDates = [...dates].sort();
        if (sortedDates[0] === undefined) {
          throw new InternalError("Resource does not have any dates.");
        }

        resourceDetails.lastUpdated = sortedDates.at(-1);
        resourceDetails.firstUpdated = sortedDates[0];
        resourceDetails.dates = sortedDates;
        resourceDetails.nVersions = sortedDates.length;
        resourceDetails.updateCadence = _updateCadence(
          sortedDates.map((date) => new Date(date)),
        );
      }

      (store[groupName] ??= []).push(resourceDetails);

      return store;
    },
    {},
  );
}

/**
 * Helper function for sorting datasets in a way that is nicer than
 * pure lexicographic sorting when dealing with temporal datasets
 * names (e.g., "12y", "2y", "6m", etc.)
 *
 * @param words - list of strings to sort
 */
function _sortableName(words: string[]): string {
  const w = words.map((word) => {
    const m = word.match(/^(\d+)([ym])$/);
    if (m && m[1]) {
      if (m[2] === "y") {
        return String(parseInt(m[1]) * 12).padStart(4, "0");
      } else {
        return m[1].padStart(4, "0");
      }
    }
    return word;
  });
  return w.join("/");
}

/** number of milliseconds in a day */
const msInADay = 1000 * 60 * 60 * 24;

/**
 * Helper function to that generates a update frequency information
 * for a resource or dataset, based on consider a set of dates
 * (corresponding to resource/dataset updates) over the past two
 * years, and applying a heuristic based on the median interval
 * between updates. Also considers consistency (essentially, the
 * variance) of the updates, and whether the resource/dataset
 * continues to be updated
 *
 * @param dateObjects - a list of Date objects corresponding to update dates
 */
function _updateCadence(dateObjects: Date[]): {
  summary: string;
  description: string;
} {
  const threshold = new Date(); // today
  threshold.setFullYear(threshold.getFullYear() - 2);

  const intervals = dateObjects
    .reduce((intervals: number[], date, idx) => {
      if (idx === 0 || date < threshold) {
        return intervals;
      }
      // get num days between subsequent dates, ignoring complexities such as DST
      const prevDate = dateObjects[idx - 1] as Date; // eslint-disable-line @typescript-eslint/consistent-type-assertions
      intervals.push(Math.round((date.getTime() - prevDate.getTime()) / msInADay));

      return intervals;
    }, [])
    .sort((a, b) => a - b);

  if (!intervals.length)
    return {
      summary: "rarely",
      description: "This dataset hasn't seen any updates in the past 2 years.",
    };

  if (intervals.length < 3) {
    return {
      summary: "rarely",
      description: `This dataset has been updated ${intervals.length + 1} times in the past 2 years.`,
    };
  }

  // typechecker is not quite smart enough to figure out that:
  // * there will always be a final object in `dateObjects`
  // * `intervals[]` will always have a middle entry and it will be a number
  // * for similar reasons, `mad` will always be a number
  const lastUpdate = dateObjects.at(-1) as Date; // eslint-disable-line @typescript-eslint/consistent-type-assertions
  const lastUpdateDaysAgo = Math.round(
    (new Date().getTime() - lastUpdate.getTime()) / msInADay,
  );
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const median = intervals[Math.floor(intervals.length / 2)] as number;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const mad = intervals.map((x) => Math.abs(x - median)).sort((a, b) => a - b)[
    Math.floor(intervals.length / 2)
  ] as number;

  let description: string;
  description = `Over the past two years this dataset's been updated ${mad * 2 > median ? "irregularly" : "consistently"} every `;
  description += median === 1 ? "~day" : `~${median} days`;
  if (lastUpdateDaysAgo > median * 3)
    description += ", however it hasn't been updated for a while";
  description += ".";

  let summary: string;
  if (median <= 1) {
    summary = "daily";
  } else if (median < 4) {
    summary = "every few days";
  } else if (median < 10) {
    summary = "weekly";
  } else if (median < 18) {
    summary = "fortnightly";
  } else if (median < 40) {
    summary = "monthly";
  } else {
    summary = "rarely";
  }

  return { summary, description };
}
