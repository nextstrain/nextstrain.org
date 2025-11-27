import { ResourceType, Resource, Group, PathVersionsForGroup, FetchGroupHistory } from "./types";
import { InternalError } from "../error-boundary";
import fetchAndParseJSON from "../../util/fetch-and-parse-json";
import nextstrainLogoSmall from "../../static/logos/nextstrain-logo-small.png";

interface APIWrapper<T> {
  [resourceType: string]: {
    [sourceId: string]: T
  }
}

interface ResourceListingDatasets {
  pathPrefix: string;
  pathVersions: Record<string, string[]>;
}

interface ResourceListingIntermediates {
  pathPrefix: string;
  latestVersions: {
    [id: string]: {
      [filename: string]: [url: string, mostRecentlyIndexed: string]
    }
  }
}

/**
 * A callback function used by the <ListResources> component to fetch information
 * about the resources to list from the host server's /list-resources API endpoint.
 */
export async function listResourcesAPI(
  sourceId: string,
  resourceType: ResourceType,
  {versioned, groupDisplayNames, groupUrl, groupUrlTooltip}: {
    /** Report prior versions of each resource.
     * TODO: infer this from the API data itself
     */
    versioned: boolean,
    groupDisplayNames?: Record<string, string>,
    groupUrl?: (groupName: string) => string,
    groupUrlTooltip?: (groupName: string) => string
  }
): Promise<Group[]> {
  const requestPath = `/list-resources/${sourceId}/${resourceType}`;
  const response = await fetchAndParseJSON<APIWrapper<ResourceListingDatasets |  ResourceListingIntermediates>>(requestPath);
  const data = response?.[resourceType]?.[sourceId];
  if (data===undefined) {
    throw new Error(`Resources request to ${requestPath} returned no data for source ${sourceId}, resource ${resourceType}`)
  }
  const urlBuilder = (name: string) => `/${data.pathPrefix}${name}`;
  const areDatasets = (x: ResourceListingDatasets |  ResourceListingIntermediates): x is ResourceListingDatasets => {
    return Object.hasOwn(x, 'pathVersions');
  }
  const groups = Object.entries(
      areDatasets(data) ?
        groupDatasetsByPathogen(data.pathVersions, urlBuilder, versioned) :
        groupIntermediatesByPathogen(data.latestVersions)
    ).map(([groupName, resources]) => {
      const group = resourceGroup(groupName, resources);
      if (groupDisplayNames && groupName in groupDisplayNames) {
        group.groupDisplayName = groupDisplayNames[groupName];
      }
      if (groupUrl) {
        group.groupUrl = groupUrl(groupName);
      }
      if (groupUrlTooltip) {
        group.groupUrlTooltip = groupUrlTooltip(groupName);
      }
      if (resourceType==='intermediate' && sourceId==='core') {
        group.fetchHistory = fetchIntermediateGroupHistoryFactory(sourceId, groupName);
      }
      return group;
    });

  return groups;
}

function resourceGroup(groupName: string, resources: Resource[]): Group {
  const lastUpdated = resources
    .map((r) => r.lastUpdated)
    .sort()
    .at(-1);

  const nVersions = resources.reduce(
    (total, r) => (r.nVersions ? total + r.nVersions : total),
    0,
  ) || undefined;

  const groupInfo: Group = {
    groupName,
    groupImgSrc: nextstrainLogoSmall.src,
    groupImgAlt: "nextstrain logo",
    resources,
    nResources: resources.length,
    nVersions,
    lastUpdated,
  };

  return groupInfo;
}

/**
 * Group the provided `pathVersions` by pathogen, which is determined
 * by inspecting the path. For instance, 'seasonal-flu/h3n2' is grouped
 * under 'seasonal-flu'. Each pathogen has an array of Resource
 * objects, each corresponding to a single dataset. 
 */
function groupDatasetsByPathogen(
  /** object mapping path to lists of dates */
  pathVersions: ResourceListingDatasets['pathVersions'],

  /** constructs the dataset URL from the provided resource name/ID */
  urlBuilder: (name: string) => string,

  /** boolean controlling addition of version-specific fields */
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
        url: urlBuilder(name),
      };

      if (versioned) {
        const sortedDates = [...dates].sort();
        if (sortedDates[0] === undefined) {
          throw new InternalError("Resource does not have any dates.");
        }
        const lastUpdated = sortedDates.at(-1) as string; // eslint-disable-line @typescript-eslint/consistent-type-assertions
        resourceDetails.lastUpdated = lastUpdated;
        resourceDetails.firstUpdated = sortedDates[0];
        resourceDetails.dates = sortedDates;
        resourceDetails.nVersions = sortedDates.length;
        resourceDetails.updateCadence = _updateCadence(
          sortedDates.map((date) => new Date(date)),
        );
        const nDaysOld = _timeDelta(lastUpdated);
        if (nDaysOld && nDaysOld>365) {
          resourceDetails.outOfDateWarning = `Warning! This dataset may be over a year old. Last known update on ${lastUpdated}`;
        }
      }
      (store[groupName] ??= []).push(resourceDetails);

      return store;
    },
    {},
  );
}

function groupIntermediatesByPathogen(
  latestVersions: ResourceListingIntermediates['latestVersions']
): Record<string, Resource[]> {
  return Object.entries(latestVersions).reduce(
    (store: Record<string, Resource[]>, [baseName, d]) => {
      // base name does not include the filename
      const baseParts = baseName.split("/");
      if (baseParts[0] === undefined) {
        throw new InternalError(`Resource is not properly formatted (empty name)`);
      }
      const groupName = baseParts[0];
      for (const [filename, urlDatePair] of Object.entries(d)) {
        if (filename==='mostRecentlyIndexed') continue;
        const nameParts = [...baseParts, filename]
        const [url, lastUpdated] = urlDatePair;
        const resourceDetails: Resource = {
          name: nameParts.join('/'), // includes filename
          groupName, // decoupled from nameParts
          nameParts,
          sortingName: _sortableName(nameParts),
          url,
          lastUpdated,
        };
        const nDaysOld = _timeDelta(lastUpdated);
        if (nDaysOld && nDaysOld>365) {
          resourceDetails.outOfDateWarning = `Warning! This file may be over a year old. Last known update on ${lastUpdated}`;
        }
        (store[groupName] ??= []).push(resourceDetails);
      }

      return store;
    },
    {},
  );
}

/**
 * Helper function for sorting datasets in a way that is nicer than
 * pure lexicographic sorting when dealing with temporal datasets
 * names (e.g., "12y", "2y", "6m", etc.)
 */
function _sortableName(
  /** list of strings to sort*/
  words: string[],
): string {
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
 */
function _updateCadence(
  /** a list of Date objects corresponding to update dates */
  dateObjects: Date[],
): {
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


/**
 * Returns a function which is used as a callback to get the full history for the group
 */
function fetchIntermediateGroupHistoryFactory(
  sourceId: string,
  groupName: string,
): FetchGroupHistory {
  return async () => {
    const resourceType = 'intermediate';
    const requestPath = `/list-resources/${sourceId}/${resourceType}?groupHistory=${groupName}`;
    const response = await fetchAndParseJSON<APIWrapper<{pathVersions: PathVersionsForGroup}>>(requestPath);
    const data = response?.[resourceType]?.[sourceId]?.pathVersions;
    if (data===undefined) {
      throw new Error(`Resources request to ${requestPath} returned no data for source ${sourceId}, resource ${resourceType}`)
    }
    return data;
  }
}


/**
 * Return the number of days between the provided date (YYYY-MM-DD) and today.
 * Note that due to subleties around dates, time zones etc this may be +- 1 day.
 */
function _timeDelta(t: string): number|null {
  const [year, month, day] = t.split("-").map(Number);
  if (year===undefined || month===undefined ) return null;
  const d = new Date(year, month - 1, day);
  return Math.round((new Date().getTime() - d.getTime()) / msInADay);
}
