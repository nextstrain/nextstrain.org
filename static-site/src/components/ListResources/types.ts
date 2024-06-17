import { Card } from "../Showcase/types"

export interface FilterOption {
  value: string
  label: string
}

export interface Group {
  groupName: string
  nResources: number
  nVersions?: number
  lastUpdated: string  // date
  resources: Resource[]
  groupUrl?: string
  groupDisplayName?: string
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

// See coreShowcase in static-site/content/resource-listing.yaml
export interface FilterCard extends Card {
  filters: string[]
}

// See coreQuickLinks in static-site/content/resource-listing.yaml
export interface QuickLink {
  name: string
  display: string
  groupName?: string
}
