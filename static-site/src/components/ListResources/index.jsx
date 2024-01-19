import React, { useState, useEffect, useMemo, useCallback } from 'react';
/* Default import for react-tooltip v5 is ES modules, but webpack baulks at that.
Using the available common JS build instead to avoid having to debug Gatsby, which
isn't a nice experience and which we plan to replace shortly  */
import {Tooltip} from 'react-tooltip-v5/dist/react-tooltip.cjs';
import 'react-tooltip-v5/dist/react-tooltip.css';
// import "./cards.css";
import { useSortAndFilterData, useFilterOptions } from './helpers';
import CreatableSelect from 'react-select/creatable';
import {Spinner} from './spinner';
import { ResourceListing } from "./ResourceListing";
import {Showcase} from "./Showcase";
import { ResourceModal } from "./ResourceModal";
import { DateUpdatedSelector } from "./DateUpdatedSelector";

function ListResources({apiQuery, dataType}) {
  console.log("<ListResources>")
  const originalData = useDataFetch(apiQuery, dataType);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState([]);
  const [sortMethod, changeSortMethod] = useState("lastUpdated");
  const [resourceGroups, setResourceGroups] = useState([]);
  const [modalResourceData, setModalResourceData ] = useState(null);
  const dismissModal = useCallback(() => setModalResourceData(null), [])
  useSortAndFilterData(sortMethod, selectedFilterOptions, originalData, setResourceGroups)
  const availableFilterOptions = useFilterOptions(resourceGroups);

  console.log("ListResources::modalResourceData", modalResourceData)

  /* TODO - add setModalResourceData to context? lots of prop drilling at the moment */

  const showcaseData = useMemo(() => [{'name': 'A'}, {'name': 'B'}, {'name': 'C'}], []); // SUpplied as a prop + then decorated here

  if (!resourceGroups?.length) {
    return (
      <div className="cardsV2">
        <div id="cardsContainer">
          <Spinner/>
        </div>
      </div>
    )
  }

  return (
    <div className="cardsV2"> {/* TODO change classname */}
      <div id="cardsContainer"> {/* TODO change id / remove */}

        <Showcase data={showcaseData}/>

        <Filter options={availableFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>

        <DateUpdatedSelector/>

        <SortOptions sortMethod={sortMethod} changeSortMethod={changeSortMethod}/>

        <ResourceListing data={resourceGroups} setModal={setModalResourceData} />

        <Tooltip id="iconTooltip" />

        <ResourceModal data={modalResourceData} dismissModal={dismissModal}/>

      </div>
    </div>
  )
}

export default ListResources

/**
 * TODO XXX - parametrise etc
 */
function useDataFetch() {
  const [state, setState] = useState(undefined);
  useEffect(() => {
    console.log("ListResources::useDataFetch::useEffect")
    async function fetchAndParse() {
      const url = `http://localhost:5000/list-resources`;
      console.log(`Fetching from ${url}`)
      try {
        setState(
          await fetch(url)
            .then((res) => res.json())
            // .then((jsn) => jsn[dataType] || [])
            // .then((cards) => cardHierarchy(cards))
        )
      } catch (err) {
        console.error(err);
        return;
      }
    }
    fetchAndParse();
  }, []);
  return state
}


function SortOptions({sortMethod, changeSortMethod}) {
  function onChangeValue(event) {
    changeSortMethod(event.target.value);
  }
  return (
    <div className="radioSort">
      Sort cards by: 
      <input type="radio" onChange={onChangeValue} value="alphabetical" checked={"alphabetical"===sortMethod} /> alphabetical
      <input type="radio" onChange={onChangeValue} value="lastUpdated" checked={"lastUpdated"===sortMethod} /> lastUpdated
    </div>
  )
}

function Filter({options, setSelectedFilterOptions}) {
  return (
    <div className="filter">
      <CreatableSelect
        placeholder={"Filter by words in dataset names, or type in your own substring"}
        isMulti options={options}
        onChange={setSelectedFilterOptions}
      />
    </div>
  )

}