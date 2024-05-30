import React, { useState, useRef, useEffect } from 'react';
import { InternalLink } from '../Misc/internal-link';
import styled from 'styled-components';
import Select from 'react-select';
import ScrollableAnchor from '../../../vendored/react-scrollable-anchor/index';
import {Tooltip} from 'react-tooltip-v5';
import { useFilterOptions } from './useFilterOptions';
import { useSortAndFilter } from "./useSortAndFilter";
import { useDataFetch } from "./useDataFetch";
import {Spinner} from '../Spinner/Spinner';
import { ResourceGroup } from './ResourceGroup';
import { ErrorContainer } from "../../pages/404";
import { TooltipWrapper } from "./IndividualResource";
import {ResourceModal, SetModalContext} from "./Modal";
import { Showcase, useShowcaseCards} from "./Showcase";

export const LIST_ANCHOR = "list";

/**
 * A React component to fetch data and display the available resources,
 * including past versions ("snapshots").
 *
 * Note that currently this only uses 'dataset' resources. In the future this
 * will be expanded. Similarly, we define versioned: boolean here in the UI whereas
 * this may be better expressed as a property of the API response.
 */
function ListResources({
  sourceId,
  versioned=true,
  elWidth,
  quickLinks,
  defaultGroupLinks=false, /* should the group name itself be a url? (which we let the server redirect) */
  groupDisplayNames, /* mapping from group name -> display name */
  showcase, /* showcase cards */
}) {
  const [originalData, dataError] = useDataFetch(sourceId, versioned, defaultGroupLinks, groupDisplayNames);
  const showcaseCards = useShowcaseCards(showcase, originalData);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState([]);
  const [sortMethod, changeSortMethod] = useState("alphabetical");
  const [resourceGroups, setResourceGroups] = useState([]);
  useSortAndFilter(sortMethod, selectedFilterOptions, originalData, setResourceGroups)
  const availableFilterOptions = useFilterOptions(resourceGroups);
  const [modal, setModal ] = useState(null);

  if (dataError) {
    return (
      <ErrorContainer>  
        {"Whoops - listing resources isn't working!"}
        <br/>
        {'Please '}<InternalLink href="/contact" style={{fontWeight: 300}}>get in touch</InternalLink>{" if this keeps happening"}
      </ErrorContainer>
    )
  }

  if (!resourceGroups?.length) {
    return (
      <div>
        <Spinner/>
      </div>
    )
  }

  return (
    <ListResourcesContainer>

      <Showcase cards={showcaseCards} setSelectedFilterOptions={setSelectedFilterOptions}/>

      <Filter options={availableFilterOptions} selectedFilterOptions={selectedFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>

      <SortOptions sortMethod={sortMethod} changeSortMethod={changeSortMethod}/>

      <SetModalContext.Provider value={setModal}>
        <ScrollableAnchor id={LIST_ANCHOR}>
          <div>
            {resourceGroups.map((group) => (
              <ResourceGroup key={group.groupName}
                data={group} quickLinks={quickLinks}
                elWidth={elWidth}
                numGroups={resourceGroups.length}
                sortMethod={sortMethod}
              />
            ))}
          </div>
        </ScrollableAnchor>
      </SetModalContext.Provider>

      <Tooltip style={{fontSize: '1.6rem'}} id="listResourcesTooltip"/>

      { versioned && (
        <ResourceModal data={modal} dismissModal={() => setModal(null)}/>
      )}

    </ListResourcesContainer>
  )
}


/**
 * A wrapper element which monitors for resize events affecting the dom element.
 * Because of the responsive CSS design in parent components, most of the time
 * this only fires as we cross the specified thresholds so there's no need to
 * debounce. However when we are below the smallest threshold (currently 768px)
 * the resizes happen frequently and debouncing would be better. From limited
 * testing it's not too slow and these resizes should be infrequent.
 */
function ListResourcesResponsive(props) {
  const ref = useRef(null);
  const [elWidth, setElWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setElWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div ref={ref}>
      <ListResources {...props} elWidth={elWidth}/>
    </div>
  )
}

export default ListResourcesResponsive


function SortOptions({sortMethod, changeSortMethod}) {
  function onChangeValue(event) {
    changeSortMethod(event.target.value);
  }
  return (
    <SortContainer>
      Sort pathogens by: 
      <input id="alphabetical" type="radio" onChange={onChangeValue} value="alphabetical"
        checked={"alphabetical"===sortMethod} style={{cursor: "alphabetical"===sortMethod ? 'default' : 'pointer'}}/>
      <TooltipWrapper description={'Pathogen groups ordered alphabetically. ' +
        '<br/>' +
        'Datasets within each group ordered alphabetically.'}>
        <label htmlFor='alphabetical' style={{cursor: "alphabetical"===sortMethod ? 'default' : 'pointer'}}>
          alphabetical
        </label>
      </TooltipWrapper>
      <input id='lastUpdated' type="radio" onChange={onChangeValue} value="lastUpdated"
        checked={"lastUpdated"===sortMethod} style={{cursor: "lastUpdated"===sortMethod ? 'default' : 'pointer'}}/>
      <TooltipWrapper description={'Pathogen groups ordered by the most recently updated dataset within that group. ' +
        '<br/>' +
        'Datasets within each group ordered by their latest update date.'}>
        <label htmlFor='lastUpdated' style={{cursor: "lastUpdated"===sortMethod ? 'default' : 'pointer'}}>
          most recently updated
        </label>
      </TooltipWrapper>
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
          placeholder: (baseStyles) => ({...baseStyles, fontSize: "1.6rem"}),
          input: (baseStyles) => ({...baseStyles, fontSize: "1.6rem"}),
          option: (baseStyles) => ({...baseStyles, fontSize: "1.4rem"}),
          multiValue: (baseStyles) => ({...baseStyles, fontSize: "1.6rem", backgroundColor: '#f4d5b7'}), // TODO XXX
        }}
      />
    </div>
  )

}

const ListResourcesContainer = styled.div`
  font-size: 1.8rem;
  color: #4F4B50;
`

const SortContainer = styled.div`
  display: flex;
  padding-top: 20px;
  padding-bottom: 30px;
  & input {
    margin-left: 20px;
    margin-right: 5px;
  }
`