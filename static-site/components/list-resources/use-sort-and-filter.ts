import { useMemo } from 'react';
import { convertVersionedGroup, FilterOption, Group, Resource, SortMethod, VersionedGroup } from './types';


export const useSortAndFilter = (
    sortMethod: SortMethod,
    selectedFilterOptions: readonly FilterOption[],
    setState: React.Dispatch<React.SetStateAction<Group[]>>,
    originalData?: Group[],
  ) => {
  useMemo(() => {
    if (!originalData) return;
    /* Following console log is really useful for development */
    // console.log(`useSortAndFilter() sortMethod "${sortMethod}" ` + (selectedFilterOptions.length ? `filtering to ${selectedFilterOptions.map((el) => el.value).join(", ")}` : '(no filtering)'))

    const searchValues = selectedFilterOptions.map((o) => o.value);
    function _filterResources(resource: Resource) {
      if (searchValues.length===0) return true;
      return searchValues
        .map((searchString) => resource.nameParts.includes(searchString))
        .every((x) => x);
    }

    function sortAndFilter<T extends Group>(
      groups: T[],
      sortGroups: (a: T, b: T) => number,
      sortResources: (a: Resource, b: Resource) => number,
    ): T[] {
      return groups
        .map((group) => ({
          ...group,
          resources: group.resources
            .filter(_filterResources)
            .sort(sortResources)
        }))
        .filter((group) => !!group.resources.length)
        .sort(sortGroups);
    }

    if (sortMethod === "lastUpdated") {
      const groups = originalData.map((group: Group) => convertVersionedGroup(group))
      const _sortGroups = (groupA: VersionedGroup, groupB: VersionedGroup) => _newestFirstSort(groupA.lastUpdated, groupB.lastUpdated)
      const _sortResources = (a: Resource, b: Resource) => {
        if (!a.lastUpdated || !b.lastUpdated || a.lastUpdated === b.lastUpdated) {
          // resources updated on the same day or without a last updated date
          // sort alphabetically
          return _lexicographicSort(a.name, b.name)
        }
        else {
          return _newestFirstSort(a.lastUpdated, b.lastUpdated);
        }
      }
      const resourceGroups = sortAndFilter(groups, _sortGroups, _sortResources)
      setState(resourceGroups)
    } else if (sortMethod === "alphabetical") {
      const groups = originalData;
      const _sortGroups = (groupA: Group, groupB: Group) => _lexicographicSort(groupA.groupName.toLowerCase(), groupB.groupName.toLowerCase())
      const _sortResources = (a: Resource, b: Resource) => _lexicographicSort(a.name, b.name)
      const resourceGroups = sortAndFilter(groups, _sortGroups, _sortResources)
      setState(resourceGroups)
    }
  }, [sortMethod, selectedFilterOptions, originalData, setState])
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