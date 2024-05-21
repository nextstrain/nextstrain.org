// FIXME: is this in react-select?
export type FilterOption = {
    value: string
    label: string
}

export type Group = {
    groupName: string
    nResources: number
    nVersions?: number
    lastUpdated: any
    resources: Resource[]
    groupUrl?: string
    groupDisplayName?: string
}

export type Resource = {
    name: string
    groupName: string
    nameParts: string[]
    sortingName: string
    url: string
    lastUpdated: any
    versioned: boolean

    // versioned
    firstUpdated?: any
    dates?: any[]
    nVersions?: number
    updateCadence?: UpdateCadence
}

export type GroupDisplayNames = {
    [name: string] : string /* group name -> display name */
  }

export type UpdateCadence = {
    summary: string
    description: string
}

// See coreShowcase in static-site/content/resource-listing.yaml
export type Card = {
    name: string
    img: string
    filters: string[]
}

// See coreQuickLinks in static-site/content/resource-listing.yaml
export type QuickLink = {
    name: string
    display: string
    groupName?: string
}
