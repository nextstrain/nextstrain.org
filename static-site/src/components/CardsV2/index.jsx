import React, { useState, useEffect } from 'react';
/* Default import for react-tooltip v5 is ES modules, but webpack baulks at that.
Using the available common JS build instead to avoid having to debug Gatsby, which
isn't a nice experience and which we plan to replace shortly  */
import {Tooltip} from 'react-tooltip-v5/dist/react-tooltip.cjs';
import 'react-tooltip-v5/dist/react-tooltip.css';
import "./cards.css";
import { Card } from "./card-component.jsx";
import { useSortAndFilter, useFilterOptions, cardHierarchy } from './helpers';
import CreatableSelect from 'react-select/creatable';
import {Spinner} from './spinner';

function CardsV2({apiQuery, dataType}) {
  console.log("<CardsV2>")
  const data = useDataFetch(apiQuery, dataType);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState([]);
  const [sortMethod, changeSortMethod] = useState("lastUpdated");
  const [orderedData, setOrderedData] = useState([]);
  useSortAndFilter(sortMethod, selectedFilterOptions, data, setOrderedData)
  const availableFilterOptions = useFilterOptions(orderedData);

  return (
    <div className="cardsV2">
      <div id="cardsContainer">

        <SortOptions sortMethod={sortMethod} changeSortMethod={changeSortMethod}/>
        <Filter options={availableFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>

        <div style={{paddingTop: '50px'}}>
          { orderedData?.length ?
            orderedData.map((c) => (<Card data={c} key={c.name} outer/>)) :
            <Spinner/>
          }
        </div>
        <Tooltip id="iconTooltip" />
      </div>
    </div>
  )
}

export default CardsV2

/**
 * TODO XXX - apiQuery is the query string, but this implementation is simply
 * the MVP to develop cards on the pathogens (core) page
 */
function useDataFetch(apiQuery, dataType) {
  const [state, setState] = useState(undefined);
  useEffect(() => {
    console.log("----- useEffect // useDataFetch")
    async function fetchAndParse() {
      const url = `/charon/getAvailable/v2?${apiQuery}`;
      console.log(`Downloading & parsing assets from ${url}`)
      try {
        setState(
          await fetch(url)
            .then((res) => res.json())
            .then((jsn) => jsn[dataType] || [])
            .then((cards) => cardHierarchy(cards))
        )
      } catch (err) {
        console.error(err);
        return;
      }
    }
    fetchAndParse();
  }, [apiQuery]);
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