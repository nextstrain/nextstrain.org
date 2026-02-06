import { InternalError } from "../error-boundary";
import { GenericTileBase } from "../expandable-tiles/types";

export interface FilterOption {
  value: string;
  label: string;
  filterType: FilterType;
}

export type FilterType = 'namePart' | 'resourceType';

export type SortMethod = "lastUpdated" | "alphabetical";

export type Group = {
  groupName: string;
  sortingGroupName: string;
  groupImgSrc?: string;
  groupImgAlt?: string;
  nResources: number;
  nVersions: number | undefined;
  lastUpdated: string | undefined;
  resources: Resource[];
  groupDisplayName?: string;
  fetchHistory?: FetchGroupHistory;
} & GroupUrlProperties

/* URL and tooltip must be defined together */
type GroupUrlProperties =
  | { groupUrl: string; groupUrlTooltip: string }
  | { groupUrl?: undefined; groupUrlTooltip?: undefined }

/* helper function / type guard */
export function isGroup(x: Group|Resource): x is Group {
  return Object.hasOwn(x, 'resources');
}

export type PathVersionsForGroup = {
  [id: string]: {
    date: string,
    [filename: string]: string
  }[]
}

export interface ChangelogFile {
  name: string;
  url: string;
}

export type GroupFilesChangelog = [
  date: string,
  ChangelogFile[]
][]


export type FetchGroupHistory = () => Promise<PathVersionsForGroup>

export type VersionedGroup = Group & {
  nVersions: number;
  lastUpdated: string;
}

export type ResourcesPerPathogen = Record<string, Resource[]>

export interface Resource {
  name: string;
  displayName?: ResourceDisplayName;
  groupName: string;
  nameParts: string[];

  /**
   * Array of name parts to display.
   * If not provided, nameParts will be used.
   */
  displayNameParts?: string[];

  sortingName: string;
  url: string;
  resourceType: ResourceType;
  lastUpdated?: string; // date
  firstUpdated?: string; // date
  dates?: string[];
  nVersions?: number;
  updateCadence?: UpdateCadence;

  /** True if the resource potentially uses restricted data. */
  maybeRestricted?: boolean;

  /** True if the resource is potentially out of date (according to the `lastUpdated` property). */
  maybeOutOfDate?: boolean;
}

/**
 * Check if the filename indicates restricted data.
 */
export function maybeRestrictedData(filename: string): boolean {
  return filename.includes("restricted");
}

export interface DisplayNamedResource extends Resource {
  displayName: ResourceDisplayName;
}

export interface VersionedResource extends Resource {
  lastUpdated: string; // date
  firstUpdated: string; // date
  dates: string[];
  nVersions: number;
  updateCadence: UpdateCadence;
}

export interface ResourceDisplayName {
  hovered: string;
  default: string;
}

export type ResourceType = 'resource'|'dataset'|'intermediate'|'narrative';
export const RESOURCE_TYPES: ResourceType[] = ['resource', 'dataset', 'intermediate', 'narrative'];
// NOTE: the resource indexer only uses a subset of these


export interface UpdateCadence {
  summary: string;
  description: string;
}

/** See coreTiles in static-site/content/resource-listing.yaml */
export interface FilterTile extends GenericTileBase {
  filters: string[];
}

/** See coreQuickLinks in static-site/content/resource-listing.yaml */
export interface QuickLink {
  name: string;
  display: string;
  groupName?: string;
}

/**
 * Utility function that converts an object typed as a `Group` into an
 * object typed as a `VersionedGroup`, by explicitly setting the
 * `nVersions` and `lastUpdated` properties on the object.
 *
 * If applied to a Group object that does not have version
 * information, will throw an `InternalError`
 */
export function convertVersionedGroup(
  /** the Group object to convert to a VersionedGroup */
  group: Group,
): VersionedGroup {
  if (group.nVersions !== undefined && group.lastUpdated !== undefined) {
    return {
      ...group,
      nVersions: group.nVersions,
      lastUpdated: group.lastUpdated,
    };
  }
  throw new InternalError("Group is not versioned.");
}

/**
 * Utility function that converts an object typed as a `Resource` into
 * an object typed as a `VersionedResounce`, by explicitly setting the
 * various versioning-specific properties on the object.
 *
 * If applied to a Resource object that does not have version
 * information, will throw an `InternalError`
 */
export function convertVersionedResource(
  /** the Resource object to convert to a VersionedResource */
  resource: Resource,
): VersionedResource {
  if (
    resource.lastUpdated !== undefined &&
    resource.firstUpdated !== undefined &&
    resource.dates !== undefined &&
    resource.nVersions !== undefined &&
    resource.updateCadence !== undefined
  ) {
    return {
      ...resource,
      lastUpdated: resource.lastUpdated,
      firstUpdated: resource.firstUpdated,
      dates: resource.dates,
      nVersions: resource.nVersions,
      updateCadence: resource.updateCadence,
    };
  }
  throw new InternalError("Resource is not versioned.");
}
