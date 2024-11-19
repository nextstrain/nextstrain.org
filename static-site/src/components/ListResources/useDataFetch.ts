import { useState, useEffect } from 'react';
import { Group, Resource, ResourceListingInfo } from './types';


/**
 * Uses the provided callback to fetch resources and parse those
 * resources into the `pathVersions` and `pathPrefix` values. The
 * callback is expected (and encouraged!) to throw() on any errors.
 *
 * Continues on to parse the `pathVersions`/`pathPrefix` data
 * structures into an array of groups, each representing a "pathogen"
 * and detailing the available resources for each, and the available
 * versions (snapshots) for each of those resources. In the case of
 * un-versioned resources, versions will be a zero-length array (i.e.,
 * `[]`)
 *
 * The current implementation defines `versioned: boolean` for the
 * entire API response, however in the future we may shift this to the
 * API response and it may vary across the resources returned.
 */
export function useDataFetch(
  versioned: boolean,
  defaultGroupLinks: boolean,
  groupDisplayNames: Record<string, string>,
  resourceListingCallback: () => Promise<ResourceListingInfo>,
) : {groups: Group[] | undefined, dataFetchError: boolean} {
  const [groups, setGroups] = useState<Group[]>();
  const [dataFetchError, setDataFetchError] = useState<boolean>(false);

  useEffect((): void => {
    async function fetchAndParse(): Promise<void> {
      try {
        const { pathPrefix, pathVersions } = await resourceListingCallback();

        /* group/partition the resources by pathogen (the first word
        of the resource path). This grouping is constant for all UI
        options so we do it a single time following the data fetch */
        const partitions = partitionByPathogen(pathVersions, pathPrefix, versioned);
        setGroups(groupsFrom(partitions, pathPrefix, defaultGroupLinks, groupDisplayNames));
      } catch (err) {
        console.error(`Error while fetching and/or parsing data`);
        console.error(err);
        return setDataFetchError(true);
      }
    }

    fetchAndParse();
  }, [versioned, defaultGroupLinks, groupDisplayNames, resourceListingCallback]);

  return {groups, dataFetchError}
}


/**
 * Groups the provided array mapping from path to dates into an object with keys
 * representing group names (pathogen names) and values which are arrays of
 * resource objects.
 */
function partitionByPathogen(
  pathVersions: Record<string, string[]>,
  pathPrefix: string,
  versioned: boolean,
) {
  return Object.entries(pathVersions).reduce((store: Record<string, Resource[]>, [name, dates]) => {
    const sortedDates = [...dates].sort();

    const nameParts = name.split('/');
    // split() will always return at least 1 string
    const groupName = nameParts[0]!;

    const resourceDetails: Resource = {
      name,
      groupName, /* decoupled from nameParts */
      nameParts,
      sortingName: _sortableName(nameParts),
      url: `/${pathPrefix}${name}`,
      lastUpdated: sortedDates.at(-1),
    };
    if (versioned) {
      resourceDetails.firstUpdated = sortedDates[0]!;
      resourceDetails.dates = sortedDates;
      resourceDetails.nVersions = sortedDates.length;
      resourceDetails.updateCadence = updateCadence(sortedDates.map((date)=> new Date(date)));
    }

    if (!store[groupName]) store[groupName] = [];
    store[groupName]!.push(resourceDetails)

    return store;
  }, {});
}


/**
 * Turn the provided partitions (an object mapping groupName to an array of resources)
 * into an array of groups.
 */
function groupsFrom(
  partitions: Record<string, Resource[]>,
  pathPrefix: string,
  defaultGroupLinks: boolean,
  groupDisplayNames: Record<string, string>,
) {
  return Object.entries(partitions).map(([groupName, resources]) => {
    const groupInfo: Group = {
      groupName: groupName,
      nResources: resources.length,
      nVersions: resources.reduce((total, r) => r.nVersions ? total+r.nVersions : total, 0) || undefined,
      lastUpdated: resources.map((r) => r.lastUpdated).sort().at(-1),
      resources,
    }
    /* add optional properties */
    if (defaultGroupLinks) {
      groupInfo.groupUrl = `/${pathPrefix}${groupName}`;
    }
    if (groupDisplayNames?.[groupName]) {
      groupInfo.groupDisplayName = groupDisplayNames[groupName];
    }
    return groupInfo;
  })
}


/**
 * Generally an alphabetical sorting of URL paths is a nice way to view the datasets,
 * however this results in temporal sorting such as [12y 2y 6m 6y] etc. This function
 * produces strings which, when sorted alphabetically, are in a nicer order.
 */
function _sortableName(words: string[]) {
  const w = words.map((word) => {
    const m = word.match(/^(\d+)([ym])$/);
    if (m && m[1]) {
      if (m[2]==='y') return String(parseInt(m[1])*12).padStart(4,'0')
      return m[1].padStart(4,'0')
    }
    return word
  })
  return w.join("/")
}


const msInADay = 1000*60*60*24

/**
 * Considers the updates over the past two years and uses a heuristic based on
 * the median interval between updates to provide a summary of how frequently
 * the resource has been updated. Also considers the consistency (essentially
 * variance) of these updates, and whether the dataset continues to be updated.
 */
function updateCadence(dateObjects) {
  const threshold = new Date(); // today
  threshold.setFullYear(threshold.getFullYear()-2)

  const intervals = dateObjects.reduce((intervals, date, idx) => {
    if (idx===0 || date < threshold) return intervals;
    // get num days between subsequent dates, ignoring complexities such as DST
    intervals.push(Math.round((date - dateObjects[idx-1])/msInADay))
    return intervals;
  }, []).sort((a, b) => a-b);

  if (!intervals.length) return {summary: "rarely", description: "This dataset hasn't seen any updates in the past 2 years."};

  if (intervals.length < 3) {
    return {summary: "rarely", description: `This dataset has been updated ${intervals.length+1} times in the past 2 years.`};
  }

  const lastUpdateDaysAgo = Math.round(((new Date()).getTime() - dateObjects.at(-1))/msInADay);
  const median = intervals[Math.floor(intervals.length/2)];
  const mad = intervals.map((x) => Math.abs(x-median)).sort((a, b) => a-b)[Math.floor(intervals.length/2)]

  let description: string;
  description = `Over the past two years this dataset's been updated ${mad*2 > median ? 'irregularly' : 'consistently'} every `;
  description += median===1 ? '~day' : `~${median} days`;
  if (lastUpdateDaysAgo > median*3) description+=", however it hasn't been updated for a while";
  description += '.';

  if (median <= 1) {
    return {summary: "daily", description};
  } else if (median < 4) {
    return {summary: "every few days", description};
  } else if (median < 10) {
    return {summary: "weekly", description};
  } else if (median < 18) {
    return {summary: "fortnightly", description};
  } else if (median < 40) {
    return {summary: "monthly", description};
  }
  return {summary: "rarely", description};
}
