import { useEffect, useState, useRef } from 'react';
import { sum } from "lodash";






// const usePrevious = (value, initialValue) => {
//   const ref = useRef(initialValue);
//   useEffect(() => {
//     ref.current = value;
//   });
//   return ref.current;
// };

// const useEffectDebugger = (effectHook, dependencies, dependencyNames = []) => {
//   const previousDeps = usePrevious(dependencies, []);

//   const changedDeps = dependencies.reduce((accum, dependency, index) => {
//     if (dependency !== previousDeps[index]) {
//       const keyName = dependencyNames[index] || index;
//       return {
//         ...accum,
//         [keyName]: {
//           before: previousDeps[index],
//           after: dependency
//         }
//       };
//     }

//     return accum;
//   }, {});

//   if (Object.keys(changedDeps).length) {
//     console.log('[use-effect-debugger] ', changedDeps);
//   }

//   useEffect(effectHook, [effectHook, ...dependencies]);
// };



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


    // function _walk(card) {
    //   // only count if it's a dataset (not an intermediate card) // TODO XXX revisit once hierarchy created
    //   if (card.url) {
    //     card.name.split('/').forEach((word) => {
    //       if (counts[word]) counts[word]++
    //       else counts[word]=1
    //     })
    //   }
    //   card.children.forEach(_walk);
    // }
    // data.forEach(_walk)
    const nCounts = Object.keys(counts).length;
    const options = Object.entries(counts)
      .sort((a,b) => a[1]<b[1] ? 1 : -1)
      .filter(([_word, count]) => count!==nCounts) // filter out search options present in all datasets (not working, TODO XXX)
      .map(([word, count]) => {
        return {value: word, label: `${word} (${count})`}
      });

    setState(options);
  }, [resourceGroups]);
  return state
}

/**
 * Given a list of cards which each represent a resource collection, we return a list of cards each
 * of which has parents & children - in other words a tree-like structure. As an example, given input
 * cards of: zika, rsv/a, rsv/b, monkeypox/mpxv, monkeypox/hmpxv1, and monkeypox/hmpxv1/big we
 * return a structure like:
 * ─ zika           
 *        ┎ rsv/a
 * ─ rsv ─┃         (rsv is itself a card but is not backed by an actual resource collection)
 *        ┗ rsv/b
 *              ┎ monkeypox/mpxv
 * ─ monkeypox ─┃
 *              ┗ monkeypox/hmpxv1 ── monkeypox/hmpxv/big
 *                  (monkeypox/hmpxv1 _is_ backed by an actual resource collection)
 *
 * @param {Card[]} cards each card conceptually represents a resource collection
 * @returns {Card[]} Each card is now part of a hierarchy, with pointers to a parent and children
 *                   Note that cards no longer necessarily represent a resource collection.
 */
export function cardHierarchy(j) {

  /** temporary - convert API response to cards array */
  const cards = Object.entries(j.datasets).map(([name, dates]) => {
    const card = {
      name,
      url: `/${name}`,
      lastUpdated: dates[0],
      versions: dates.map((date) => {
        return [date, '???']
      })
    }
    return card;
  })

  console.log("cardHierarchy:", cardHierarchy)

  const subtrees = [];

  cards.forEach((card) => {
    const nameFields = card.name.split('/');
    // pointers which are updated during forEach loops
    let hierarchyLevel = subtrees, parent = undefined;
    nameFields.forEach((nameField, idx) => {
      const n = _node(hierarchyLevel, nameField, parent)
      n.name = nameFields.slice(0, idx+1).join("/")
      if (idx===nameFields.length-1) {
        // node (card) should represent a resource collection
        n.url = card.url;
        n.lastUpdated = card.lastUpdated;
        n.versions = [...card.versions];
      }
      parent=n, hierarchyLevel=n.children; // update pointers
    })
  })

  function _node(hierarchyLevel, nameField, parent) {
    for (const level of hierarchyLevel) {
      if (level.name.split('/').slice(-1)[0]===nameField) return level;
    }
    const n = {parent, children: []}
    hierarchyLevel.push(n);
    return n;
  }
  /* We could alternatively represent the entire data as a single Card such as
  Card - name = undefined ?
       - parent = undefined ?
       - children = what's now `subtrees`
  */
  return subtrees;
}


/**
 * We need to make a copy of the underlying data structure of cards so that
 * we can manipulate it (e.g. filtering) and then return to the entire data
 * structure. Not everything needs to be deep-copied, we can keep pointers
 * into the existing data structures for properties which won't be changed.
 */
function clone(cards) {
  const copies = cards.map(_copy)
  copies.forEach(_lookBackwards)
  return copies;
  function _copy(card) {
    const copiedCard = {name: card.name};
    (['url', 'lastUpdated']).forEach((key) => {
      if (card[key]) copiedCard[key]=card[key]
    })
    /* versions are currently never modified but I'd like to enable filtering
    by time range (and others) which _will_ modify the versions array. But each
    version entry (array) is copied by reference */
    if (card.versions) copiedCard.versions = [...card.versions]
    copiedCard.children = card.children.map(_copy);
    return copiedCard;
  }
  function _lookBackwards(card) {
    card.children.forEach((c) => {c.parent = card});
  }
}

/**
 * Not all cards represent resource collections, so not all cards will have information
 * which comes from that collection. Such information (e.g. lastUpdated) is needed for
 * sorting so we add it here.
 * TODO: this algorithm is, ahh, somewhat inefficient
 */
function backpropagateInformation(cards) {
  const key = 'lastUpdated'
  cards.forEach(_add)
  return cards;
  function _add(node) {
    /**
     * It's not clear what to do with an intermediate card which represents a resource and
     * whose descendants have more recently updated resources...
     */
    if (!node.hasOwnProperty(key)) {
      const values = [];
      _collect(values, node, key);
      values.sort()
      node[key] = values.pop()
    }
    node.children.forEach(_add)
  }
  function _collect(store, node, key) {
    if (node.hasOwnProperty(key)) store.push(node[key])
    node.children.forEach((c) => _collect(store, c, key))
  }
}

function calculateCounts(cards) {
  function _propagate(card) {
    let nDatasets = 0;
    let nVersions = 0;
    function _count(card) {
      if (card.url) {
        nDatasets++
        nVersions += card.versions?.length || 0;
      }
      card.children.forEach(_count)
    }
    _count(card);
    card.nDatasets = nDatasets;
    card.nVersions = nVersions;
    card.children.forEach(_propagate);
  }
  cards.forEach(_propagate)
}

/**
 * Sorts data:Card[] in place via the provided method
 */
function sortCards(data, method) {
  let _sortFn;
  if (method==="alphabetical") {
    _sortFn = (c1, c2) => {
      if (c1.name.toLowerCase() < c2.name.toLowerCase()) return -1
      return 1
    }
  } else if (method==="lastUpdated") {
    _sortFn = (c1, c2) => {
      if (c1.lastUpdated < c2.lastUpdated) return 1 // c1 older => goes later in array
      return -1
    }
  } else {
    throw new Error(`Unknown card sorting method requested ${method}`)
  }
  if (_sortFn) {
    const _sort = (n) => {
      n.children.sort(_sortFn)
      n.children.forEach(_sort) 
    }
    data.forEach(_sort)
    data.sort(_sortFn);
  }
}



function _filterRawData(data, selectedFilterOptions) {
  if (selectedFilterOptions.length===0) return data;
  const searchValues = selectedFilterOptions.map((o) => o.value);
  return Object.fromEntries(
    Object.entries(data).filter((el) => _include(el[0]))
  )

  /* filtering is via union (AND) of selectedFilterOptions */
  function _include(name) {
    // console.log("Comparing, ", c.name, c.children.length, _hasChildren(c))
    return searchValues.map((searchString) => {
      if (searchString.includes("/")) { // user-typed search // TODO XXX they won't always have '/'!!!
        return name.includes(searchString)
      } else {  
        return name.split('/').includes(searchString)
      }
    }).every((x) => x);
  }
}

/**
 * Given the Cards[], remove the terminal cards which match the provided search terms.
 * If a non-terminal card represents a resource but doesn't match the filter options,
 * it is turned into a non-resource card. For instance, the card 'ncov/open/north-america'
 * is internal (it has children of "/1m", "/2m" etc) but also represents a resource collection.
 * If the filtering is "open" AND "north-america" then the card will be untouched; if the
 * filtering is "open" AND "north-america" AND "1m" then the resource information will be
 * removed from the card.
 * 
 * @param {*} data 
 * @param {*} selectedFilterOptions 
 * @returns 
 */
function filterCards(data, selectedFilterOptions) {
  if (selectedFilterOptions.length===0) return data;
  // Note that this would be simpler if instead of Card[] we collected everything as a single Card
  
  // filter top-level cards (data is array of Card objects)
  let filtered = data.filter((card) => _hasChildren(card) || _include(card)) // exclude terminal non-matches
  filtered.forEach((card) => { // for non-terminal cards which are a resource, make them "not a resource"
    if (_isResource(card) && !_include(card)) _stripResource(card);
  })

  // recurse through cards and perform the same filtering
  filtered.forEach(_filterDatasetCards);
  
  return filtered;

  function _filterDatasetCards(card) {  
    card.children = card.children
      .filter((card) => _hasChildren(card) || _include(card))
    card.children.forEach((card) => {
      if (_isResource(card) && !_include(card)) _stripResource(card);
    })
    card.children.forEach(_filterDatasetCards);
  }

  /* filtering is via union (AND) of selectedFilterOptions */
  function _include(c) {
    // console.log("Comparing, ", c.name, c.children.length, _hasChildren(c))
    return selectedFilterOptions.map((o) => o.value).map((searchString) => {
      if (searchString.includes("/")) { // user-typed search // TODO XXX they won't always have '/'!!!
        return c.name.includes(searchString)
      } else {  
        return c.name.split('/').includes(searchString)
      }
    }).every((x) => x);
  }

  function _hasChildren(card) {
    return card.children.length>0
  }

  function _stripResource(card) {
    delete card.url;
    delete card.versions;
    delete card.lastUpdated;
  }
}

/**
 * Prune out intermediate (non-resource-collection) cards
 * Note: calculateCounts() must have been run prior to this
 */
function pruneCards(data) {

  let pruned = data.filter((c) => c.nDatasets>0) // prune subtrees with no active collections
  pruned.forEach(_removeZeros)
  pruned.forEach(_collapse)
  return pruned;

  /* remove cards with zero descendant resources (because their nodes with attached resources have been filtered out) */
  function _removeZeros(card) {
    card.children = card.children.filter((c) => c.nDatasets>0);
    card.children.forEach(_removeZeros);
  }
  /* given a card with a single child, merge the child into this one _unless_ this card is itself a resource */
  function _collapse(card) {
    if (card.children.length===1 && !_isResource(card)) {
      // merge the child's information into this card, essentially deleting the child as it's own node
      const child = card.children[0];
      Object.keys(card)
        .filter((key) => key!=='parent')
        .forEach((key) => delete card[key]);
      Object.keys(child)
        .filter((key) => key!=='parent')
        .forEach((key) => card[key] = child[key]);
      // NOTE - the card `name` is now _only_ that of the child
    }
    card.children.forEach(_collapse);
  }

}

function _isResource(card) {
  return !!card.url;
}