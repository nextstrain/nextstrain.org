import React, { useState, useEffect } from 'react';
/* Default import for react-tooltip v5 is ES modules, but webpack baulks at that.
Using the available common JS build instead to avoid having to debug Gatsby, which
isn't a nice experience and which we plan to replace shortly  */
import {Tooltip} from 'react-tooltip-v5/dist/react-tooltip.cjs';
import 'react-tooltip-v5/dist/react-tooltip.css';
// import "./cards.css";
import { ResourceGroup } from './ResourceGroup.jsx';
import { useSortAndFilterData, useFilterOptions, cardHierarchy } from './helpers';
import CreatableSelect from 'react-select/creatable';
import {Spinner} from './spinner';

function ListResources({apiQuery, dataType}) {
  console.log("<ListResources>")
  const originalData = useDataFetch(apiQuery, dataType);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState([]);
  const [sortMethod, changeSortMethod] = useState("lastUpdated");
  const [data, setData] = useState([]);
  useSortAndFilterData(sortMethod, selectedFilterOptions, originalData, setData)
  // const availableFilterOptions = useFilterOptions(data);

  if (!data?.length) {
    return (
      <div className="cardsV2">
        <div id="cardsContainer">
          <Spinner/>
        </div>
      </div>
    )
  }

  return (
    <div className="cardsV2">
      <div id="cardsContainer">

        {/* <SortOptions sortMethod={sortMethod} changeSortMethod={changeSortMethod}/> */}
        {/* <Filter options={availableFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/> */}

        <div style={{paddingTop: '50px'}}>
          {data.map((group) => (
            <ResourceGroup data={group} key={`${group.name}_${group[0].lastUpdated}`}/>
          ))}
        </div>
        <Tooltip id="iconTooltip" />
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