import { useEffect } from 'react';


export const useSortAndFilter = (sortMethod, selectedFilterOptions, originalData, setState) => {
  useEffect(() => {
    if (!originalData) return;
    /* Following console log is really useful for development */
    // console.log(`useSortAndFilter() sortMethod "${sortMethod}" ` + (selectedFilterOptions.length ? `filtering to ${selectedFilterOptions.map((el) => el.value).join(", ")}` : '(no filtering)'))

    let _sortGroups, _sortResources;
    switch (sortMethod) {
      case "lastUpdated":
        _sortGroups = (groupA, groupB) => groupA.lastUpdated < groupB.lastUpdated; // YYYY-MM-DD strings are nicely sortable
        // resources are also sorted by last updated and for those with the same update day we use alphabetical
        _sortResources = (a, b) => a.lastUpdated === b.lastUpdated ? (a.name < b.name) : (a.lastUpdated < b.lastUpdated)
        break;
      case "alphabetical":
        _sortGroups = (groupA, groupB) => groupA.groupName.toLowerCase() > groupB.groupName.toLowerCase();
        _sortResources = (a, b) => a.name < b.name
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

