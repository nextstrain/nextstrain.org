import { InternalError } from "../ErrorBoundary";
import { Tile } from "../ExpandableTiles/types"

export interface FilterOption {
  value: string
  label: string
}

export type SortMethod = "lastUpdated" | "alphabetical";

export interface Group {
  groupName: string
  nResources: number
  nVersions: number | undefined
  lastUpdated: string | undefined
  resources: Resource[]
  groupUrl?: string
  groupDisplayName?: string
}

export interface VersionedGroup extends Group {
  nVersions: number
  lastUpdated: string
}

export function convertVersionedGroup(group: Group): VersionedGroup {
  if (group.nVersions !== undefined &&
      group.lastUpdated !== undefined) {
      return {
        ...group,
        nVersions: group.nVersions,
        lastUpdated: group.lastUpdated,
      }
  }
  throw new InternalError("Group is not versioned.");
}

export interface Resource {
  name: string
  displayName?: ResourceDisplayName
  groupName: string
  nameParts: string[]
  sortingName: string
  url: string
  lastUpdated?: string  // date
  firstUpdated?: string  // date
  dates?: string[]
  nVersions?: number
  updateCadence?: UpdateCadence
}

export interface DisplayNamedResource extends Resource {
  displayName: ResourceDisplayName
}

export interface VersionedResource extends Resource {
  lastUpdated: string  // date
  firstUpdated: string  // date
  dates: string[]
  nVersions: number
  updateCadence: UpdateCadence
}

export function convertVersionedResource(resource: Resource): VersionedResource {
  if (resource.lastUpdated !== undefined &&
      resource.firstUpdated !== undefined &&
      resource.dates !== undefined &&
      resource.nVersions !== undefined &&
      resource.updateCadence !== undefined) {
    return {
      ...resource,
      lastUpdated: resource.lastUpdated,
      firstUpdated: resource.firstUpdated,
      dates: resource.dates,
      nVersions: resource.nVersions,
      updateCadence: resource.updateCadence
    }
  }
  throw new InternalError("Resource is not versioned.");
}

export interface ResourceDisplayName {
  hovered: string
  default: string
}

export interface ResourceListingInfo {
  pathPrefix: string
  pathVersions: Record<string, string[]>
}

export interface UpdateCadence {
  summary: string
  description: string
}

// See coreTiles in static-site/content/resource-listing.yaml
export interface FilterTile extends Tile {
  filters: string[]
}

// See coreQuickLinks in static-site/content/resource-listing.yaml
export interface QuickLink {
  name: string
  display: string
  groupName?: string
}
