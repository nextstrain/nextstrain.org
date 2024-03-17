import { useMemo } from 'react';


export const useSortAndFilter = (sortMethod, selectedFilterOptions, originalData, setState) => {
  useMemo(() => {
    if (!originalData) return;
    /* Following console log is really useful for development */
    // console.log(`useSortAndFilter() sortMethod "${sortMethod}" ` + (selectedFilterOptions.length ? `filtering to ${selectedFilterOptions.map((el) => el.value).join(", ")}` : '(no filtering)'))

    let _sortGroups, _sortResources;
    switch (sortMethod) {
      case "lastUpdated":
        _sortGroups = (groupA, groupB) => _newestFirstSort(groupA.lastUpdated, groupB.lastUpdated);
        _sortResources = (a, b) => a.lastUpdated === b.lastUpdated ?
          _lexicographicSort(a.name, b.name) : // resources updated on the same day sort alphabetically
          _newestFirstSort(a.lastUpdated, b.lastUpdated); // newest updated resources first
        break;
      case "alphabetical":
        _sortGroups = (groupA, groupB) => _lexicographicSort(groupA.groupName.toLowerCase(), groupB.groupName.toLowerCase()),
        _sortResources = (a, b) => _lexicographicSort(a.name, b.name)
        break;
      default:
        throw new Error(`Unknown sorting method "${sortMethod}"`)
    }

    const searchValues = selectedFilterOptions.map((o) => o.value);
    function _filterResources(resource) {
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
  }, [sortMethod, selectedFilterOptions, originalData, setState])
}


/* helper function to sort alphabetically. If provided with YYYY-MM-DD strings
 * this is the same as a chronological sort (oldest to newest)
 */
function _lexicographicSort(a,b) {
  return a<b ? -1 : a>b ? 1 : 0;
}

/* If provided with YYYY-MM-DD strings this sorts chronologically with newest
 * first (this is just reverse lexicographic sort)
 */
function _newestFirstSort(a,b) {
  return a<b ? 1 : a>b ? -1 : 0;
}