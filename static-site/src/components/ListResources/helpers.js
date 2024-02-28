import { useEffect, useState } from 'react';
import { sum } from "lodash";



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
    let data = JSON.parse(JSON.stringify(originalData.datasets)); // Data comes from a JSON API
    console.log("original data", originalData)
    data = _filterRawData(data, selectedFilterOptions);

    // console.log("\tsorting not yet implemented TODO XXX")

    /* data into 1-deep levels based on lastUpdated */
    /* this could be a lot more efficient */
    const lastUpdated = [...new Set(
      Object.values(data).map((dates) => dates[0])
    )].sort().reverse();
    let dataByUpdated = lastUpdated.map(() => ({}));
    Object.entries(data).forEach(([name, dates]) => {
      const store = dataByUpdated[lastUpdated.indexOf(dates[0])];
      const [groupName, ...nameParts] = name.split('/');
      const info = {
        name,
        groupName,
        nameParts,
        lastUpdated: dates[0],
        dates,
        nVersions: dates.length,
      };
      if (!store[groupName]) store[groupName] = [];
      store[groupName].push(info);
    });
    dataByUpdated = dataByUpdated
      .map((obj) => Object.entries(obj))
      .flat()
      .map(([groupName, groupResources]) => {
        const groupInfo = {
          groupName,
          lastUpdated: groupResources[0].lastUpdated, /* all resources in group are the same */
          nResources: groupResources.length,
          nVersions: sum(groupResources.map((r) => r.nVersions)),
        }
        /* sort the resources by their name, so (e.g.) flu/seasonal/h3n2/ha/*
         are grouped together, then flu/seasonal/h3n2/ha/*, etc */
        groupResources.sort((a, b) => a.name > b.name)
        return [groupInfo, groupResources];
      })
    console.log(dataByUpdated)

    
    // dataByUpdated = [dataByUpdated[0]]
    // dataByUpdated[0][1] = dataByUpdated[0][1].slice(-1)

    setState(dataByUpdated);

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

    for (const [_, resources] of resourceGroups) {
      for (const resource of resources) {
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
