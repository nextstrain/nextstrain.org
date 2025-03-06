import { InternalError } from "../error-boundary";
import { GenericTileBase } from "../expandable-tiles/types";

export interface FilterOption {
  value: string;
  label: string;
}

export type SortMethod = "lastUpdated" | "alphabetical";

export interface Group {
  groupName: string;
  nResources: number;
  nVersions: number | undefined;
  lastUpdated: string | undefined;
  resources: Resource[];
  groupUrl?: string;
  groupDisplayName?: string;
}

export interface VersionedGroup extends Group {
  nVersions: number;
  lastUpdated: string;
}

export interface Resource {
  name: string;
  displayName?: ResourceDisplayName;
  groupName: string;
  nameParts: string[];
  sortingName: string;
  url: string;
  lastUpdated?: string; // date
  firstUpdated?: string; // date
  dates?: string[];
  nVersions?: number;
  updateCadence?: UpdateCadence;
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

export interface ResourceListingInfo {
  pathPrefix: string;
  pathVersions: Record<string, string[]>;
}

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
 *
 * @param group - the Group object to convert to a VersionedGroup
 */
export function convertVersionedGroup(group: Group): VersionedGroup {
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
 *
 * @param resource - the Resource object to convert to a VersionedResource
 */
export function convertVersionedResource(
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
