import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
/* Default import for react-tooltip v5 is ES modules, but webpack baulks at that.
Using the available common JS build instead to avoid having to debug Gatsby, which
isn't a nice experience and which we plan to replace shortly  */
import {Tooltip} from 'react-tooltip-v5/dist/react-tooltip.cjs';
import 'react-tooltip-v5/dist/react-tooltip.css';
// import "./cards.css";
import { useSortAndFilterData, useFilterOptions } from './helpers';
import Select from 'react-select';
import {Spinner} from './spinner';
import {Showcase} from "./Showcase";
import { ResourceModal } from "./ResourceModal";
import { DateUpdatedSelector } from "./DateUpdatedSelector";
import { ResourceGroup } from './ResourceGroup';
import ScrollableAnchor from "react-scrollable-anchor";

const ResourceListingContainer = styled.div`
  padding-top: 50px;
`;

function ListResources({apiQuery, dataType}) {
  console.log("<ListResources>")
  const originalData = useDataFetch(apiQuery, dataType);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState([]);
  const [sortMethod, changeSortMethod] = useState("alphabetical");
  const [resourceGroups, setResourceGroups] = useState([]);
  const [modalResourceData, setModalResourceData ] = useState(null);
  const dismissModal = useCallback(() => setModalResourceData(null), [])
  useSortAndFilterData(sortMethod, selectedFilterOptions, originalData, setResourceGroups)
  const availableFilterOptions = useFilterOptions(resourceGroups);

  console.log("resourceGroups", resourceGroups)

  /* Following useful to start with a single modal open */
  // useEffect( () => {
  //   if (!resourceGroups?.length) return;
  //   setModalResourceData(resourceGroups[0][1][0])
  // }, [resourceGroups])

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

        <Showcase data={showcaseData} availableFilterOptions={availableFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>

        <Filter options={availableFilterOptions} selectedFilterOptions={selectedFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>

        <DateUpdatedSelector/>

        <SortOptions sortMethod={sortMethod} changeSortMethod={changeSortMethod}/>

        <ScrollableAnchor id={"list"}>
          <ResourceListingContainer>
            {resourceGroups.map((group) => (
              <ResourceGroup data={group} sortMethod={sortMethod} setModal={setModalResourceData} key={group.groupName} />
              ))}
          </ResourceListingContainer>
        </ScrollableAnchor>

        <Tooltip style={{fontSize: '16px'}} id="iconTooltip" />

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
    <SortContainer>
      Sort cards by: 
      <input type="radio" onChange={onChangeValue} value="alphabetical" checked={"alphabetical"===sortMethod} /> alphabetical
      <input type="radio" onChange={onChangeValue} value="lastUpdated" checked={"lastUpdated"===sortMethod} /> lastUpdated
    </SortContainer>
  )
}

function Filter({options, selectedFilterOptions, setSelectedFilterOptions}) {
  return (
    <div className="filter">
      <Select
        placeholder={"Filter by keywords in dataset names"}
        isMulti options={options}
        value={selectedFilterOptions}
        onChange={setSelectedFilterOptions}
        styles={{
          // https://react-select.com/styles#inner-components
          placeholder: (baseStyles) => ({...baseStyles, fontSize: "16px"}),
          input: (baseStyles) => ({...baseStyles, fontSize: "16px"}),
          option: (baseStyles) => ({...baseStyles, fontSize: "14px"}),
          multiValue: (baseStyles) => ({...baseStyles, fontSize: "16px", backgroundColor: '#f4d5b7'}),
        }}
      />
    </div>
  )

}


const SortContainer = styled.div`
  padding-top: 10px;
  font-size: 1.8rem;
  & input {
    margin-left: 20px;
    margin-right: 5px;
  }

`