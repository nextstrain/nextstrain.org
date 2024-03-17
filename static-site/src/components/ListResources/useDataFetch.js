import { useState, useEffect } from 'react';


/**
 * Fetches the datasets for the provided `sourceId` and parses the data into an
 * array of groups, each representing a "pathogen" and detailing the available
 * resources for each, and the available versions (snapshots) for each of those
 * resources.
 *
 * The current implementation defines `versioned: boolean` for the entire API
 * response, however in the future we may shift this to the API response and it
 * may vary across the resources returned.
 */
export function useDataFetch(sourceId, versioned) {
  const [state, setState] = useState(undefined);
  const [error, setError] = useState(undefined);
  useEffect(() => {
    const url = `/list-resources/${sourceId}`;

    async function fetchAndParse() {
      let pathVersions, pathPrefix;
      try {
        const response = await fetch(url, {headers: {accept: "application/json"}});
        if (response.status !== 200) {
          console.error(`ERROR: fetching data from "${url}" returned status code ${response.status}`);
          return setError(true);
        }
        ({ pathVersions, pathPrefix } = (await response.json()).dataset[sourceId]);
      } catch (err) {
        console.error(`Error while fetching data from "${url}"`);
        console.error(err);
        return setError(true);
      }

      /* group/partition the resources by pathogen (the first word of the
      resource path). This grouping is constant for all UI options so we do it a
      single time following the data fetch */
      try {
        const partitions = partitionByPathogen(pathVersions, pathPrefix, versioned)
        setState(groupsFrom(partitions, pathPrefix));
      } catch (err) {
        console.error(`Error while parsing fetched data`);
        console.error(err);
        return setError(true);
      }
    }

    fetchAndParse();
  }, [sourceId, versioned]);
  return [state, error]
}


/**
 * Groups the provided array of pathVersions into an object with keys
 * representing group names (pathogen names) and values which are arrays of
 * resource objects. 
 */
function partitionByPathogen(pathVersions, pathPrefix, versioned) {

  return Object.entries(pathVersions).reduce(reduceFn, {});
  
  function reduceFn(store, datum) {
    const name = datum[0];
    const nameParts = name.split('/');
    const sortedDates = [...datum[1]].sort();

    let groupName = nameParts[0];

    if (!store[groupName]) store[groupName] = []
    const resourceDetails = {
      name,
      groupName, /* decoupled from nameParts */
      nameParts,
      sortingName: _sortableName(nameParts),
      url: `/${pathPrefix}${name}`,
      lastUpdated: sortedDates.at(-1),
      versioned
    };
    if (versioned) {
      resourceDetails.firstUpdated = sortedDates[0];
      resourceDetails.lastUpdated = sortedDates.at(-1);
      resourceDetails.dates = sortedDates;
      resourceDetails.nVersions = sortedDates.length;
    }
    store[groupName].push(resourceDetails)

    return store;
  }
}


/**
 * Turn the provided partitions (an object mapping groupName to an array of resources)
 * into an array of groups.
 */
function groupsFrom(partitions, pathPrefix) {
  return Object.entries(partitions).map(makeGroup)

  function makeGroup([groupName, resources]) {
    const groupInfo = {
      groupName: groupName,
      groupUrl: `${pathPrefix}${groupName}`,
      nResources: resources.length,
      nVersions: resources.reduce((total, r) => r.nVersions ? total+r.nVersions : total, 0) || undefined,
      lastUpdated: resources.map((r) => r.lastUpdated).sort().at(-1),
      resources,
    }
    return groupInfo;
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