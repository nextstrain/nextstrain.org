import { useEffect, useState } from 'react';



/**
 * React hook which manipulates data about resources + versions and returns them in a
 * form for display.
 * 
 * 
 * @param {string} method 
 * @param {string[]} selectedFilterOptions 
 * @param {TKTK} originalData
 * @param {function} setState 
 * @returns {TKTK}
 */
export const useSortAndFilterData = (sortMethod, selectedFilterOptions, originalData, setState) => {
  useEffect(() => {
    if (!originalData) return;
    console.log(`useSortAndFilterData:: sortMethod "${sortMethod}" ` + (selectedFilterOptions.length ? `filtering to ${selectedFilterOptions.map((el) => el.value).join(", ")}` : '(no filtering)'))
    // TODO XXX - the original implementation used JSON stringify & parse to ensure a deep copy
    // but we shouldn't need to do this
    let data = JSON.parse(JSON.stringify(originalData.datasets)); // Data comes from a JSON API
    data = _filterRawData(data, selectedFilterOptions);

    /**
     * Function which returns a reducer function. 
     */
    function partitionBy(method) {
      return function(store, datum) {
        const name = datum[0];
        const nameParts = name.split('/');
        const sortedDates = [...datum[1]].sort(); // TODO - should be done as we parse the API response

        let groupName
        if (method === 'lastUpdated') {
          groupName = sortedDates.at(-1)
        } else {
          if (method !== 'alphabetical') {
            console.error(`Unknown sort method ${method} - falling back to alphabetical sorting`)
          }
          groupName = nameParts[0];
          // following is a hack to mock in-progress work which separates out these namespaces (url-spaces?)
          if (groupName === 'flu') {
            groupName = nameParts[1] === 'seasonal' ? 'seasonal-flu' : 'avian-flu';
          }
        }

        if (!store[groupName]) store[groupName] = []
        const resourceDetails = {
          name,
          groupName, /* decoupled from nameParts */
          nameParts, /* we should use this in child components rather than lots of splitting on '/' */
          sortingName: _sortableName(nameParts),
          firstUpdated: sortedDates[0],
          lastUpdated: sortedDates.at(-1),
          dates: sortedDates,
          nVersions: sortedDates.length,
        };
        store[groupName].push(resourceDetails)
        return store;
      }
    }

    /**
     * Turn the array of resources (via `partition`) into a group object
     */
    function makeGroup([groupName, resources]) {
      const groupInfo = {
        groupName,
        nResources: resources.length,
        nVersions: resources.reduce((total, r) => total+r.nVersions, 0),
        firstUpdated: resources.map((r) => r.firstUpdated).sort()[0],
        lastUpdated: resources.map((r) => r.lastUpdated).sort().at(-1),
        resources: resources.sort(sortGroupResources),
      }
      return groupInfo;
    }

    /**
     * Within each group we sort the resources by their lastUpdated date.
     * Perhaps this could be an option in the future, or maybe link to the
     * higher-level group-sort option (e.g. what if we sorted by oldestDataset
     * or oldest-lastUpdated?)
     * 
     * For resources last updated on the same day we sort alphabetically
     */
    function sortGroupResources(a, b) {
      return a.lastUpdated === b.lastUpdated ? (a.name < b.name) : (a.lastUpdated < b.lastUpdated)
    }

    const partition = partitionBy(sortMethod);
    const partitions = Object.entries(data).reduce(partition, {});
    const resourceGroups = Object.entries(partitions).map(makeGroup);
    setState(resourceGroups);
  }, [sortMethod, selectedFilterOptions, originalData, setState])
}


/**
 * React hook which scans the provided data (cards) and returns the
 * available filtering options. These options are dependent on the
 * current subset of cards displayed -- e.g. if you've previously
 * filtered by "flu", then the updated set of available filtering
 * options should only consider keywords in flu-like datasets.
 */
export function useFilterOptions(resourceGroups) {
  const [state, setState] = useState([]);

  useEffect(() => {
    console.log("ListResources::useFilterOptions::useEffect")

    const counts = {};
    const increment = (key) => {
      if (!counts[key]) counts[key] = 0;
      counts[key]++
    }

    for (const group of resourceGroups) {
      for (const resource of group.resources) {
        increment(resource.groupName);
        resource.nameParts.forEach(increment);
      }
    }

    const nCounts = Object.keys(counts).length;
    const options = Object.entries(counts)
      .sort((a,b) => a[1]<b[1] ? 1 : -1)
      .filter(([_, count]) => count!==nCounts) // filter out search options present in all datasets (not working, TODO XXX)
      .map(([word, count]) => {
        return {value: word, label: `${word} (${count})`}
      });

    setState(options);
  }, [resourceGroups]);
  return state
}


function _filterRawData(data, selectedFilterOptions) {
  if (selectedFilterOptions.length===0) return data;
  const searchValues = selectedFilterOptions.map((o) => o.value);
  return Object.fromEntries(
    Object.entries(data).filter((el) => _include(el[0]))
  )

  /* filtering is via union (AND) of selectedFilterOptions */
  function _include(name) {
    const words = name.split('/')
    return searchValues.map((searchString) => words.includes(searchString)).every((x) => x);
  }
}


/**
 * Generally an alphabetical sorting of URL paths is a nice way to view the datasets,
 * however this results in temporal sorting such as [12y 2y 6m 6y] etc. This function
 * produces strings which, when sorted alphabetically, are in a nicer order.
 */
function _sortableName(words) {
  const w = words.map((word) => {
    const m = word.match(/^(\d+)([ym])$/);
    if (m) {
      if (m[2]==='y') return String(parseInt(m[1])*12).padStart(4,'0')
      return m[1].padStart(4,'0')
    }
    return word
  })
  return w.join("/")
}