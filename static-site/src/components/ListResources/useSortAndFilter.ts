import { useMemo } from 'react';
import { FilterOption, Group, Resource, SortMethod, VersionedGroup } from './types';


export const useSortAndFilter = (
    versioned: boolean,
    sortMethod: SortMethod,
    selectedFilterOptions: readonly FilterOption[],
    setState: React.Dispatch<React.SetStateAction<Group[]>>,
    originalData?: Group[],
  ) => {
  useMemo(() => {
    // Cast originalData to VersionedGroup if versioned is true
    if (!versioned || !originalData) return;
    /* Following console log is really useful for development */
    // console.log(`useSortAndFilter() sortMethod "${sortMethod}" ` + (selectedFilterOptions.length ? `filtering to ${selectedFilterOptions.map((el) => el.value).join(", ")}` : '(no filtering)'))

    let _sortGroups: (groupA: VersionedGroup, groupB: VersionedGroup) => 1 | -1 | 0,
        _sortResources: (a: Resource, b: Resource) => 1 | -1 | 0;
    switch (sortMethod) {
      case "lastUpdated":
        _sortGroups = (groupA: VersionedGroup, groupB: VersionedGroup) => _newestFirstSort(groupA.lastUpdated, groupB.lastUpdated);
        _sortResources = (a: Resource, b: Resource) => {
          if (!a.lastUpdated || !b.lastUpdated || a.lastUpdated === b.lastUpdated) {
            // resources updated on the same day or without a last updated date
            // sort alphabetically
            return _lexicographicSort(a.name, b.name)
          }
          else {
            return _newestFirstSort(a.lastUpdated, b.lastUpdated);
          }
        }
        break;
      case "alphabetical":
        _sortGroups = (groupA: VersionedGroup, groupB: VersionedGroup) => _lexicographicSort(groupA.groupName.toLowerCase(), groupB.groupName.toLowerCase()),
        _sortResources = (a: Resource, b: Resource) => _lexicographicSort(a.name, b.name)
        break;
    }

    const searchValues = selectedFilterOptions.map((o) => o.value);
    function _filterResources(resource: Resource) {
      if (searchValues.length===0) return true;
      return searchValues
        .map((searchString) => resource.nameParts.includes(searchString))
        .every((x) => x);
    }

    const resourceGroups = originalData
      .map((group) => ({
        ...group,
        resources: group.resources
          .filter(_filterResources)
          .sort(_sortResources)
      }))
      .filter((group) => !!group.resources.length)
      .sort(_sortGroups);

    setState(resourceGroups);
  }, [sortMethod, selectedFilterOptions, originalData, setState, versioned])
}


/* helper function to sort alphabetically. If provided with YYYY-MM-DD strings
 * this is the same as a chronological sort (oldest to newest)
 */
function _lexicographicSort(a: string, b: string): 1 | -1 | 0 {
  return a<b ? -1 : a>b ? 1 : 0;
}

/* If provided with YYYY-MM-DD strings this sorts chronologically with newest
 * first (this is just reverse lexicographic sort)
 */
function _newestFirstSort(a: string, b: string): 1 | -1 | 0 {
  return a<b ? 1 : a>b ? -1 : 0;
}