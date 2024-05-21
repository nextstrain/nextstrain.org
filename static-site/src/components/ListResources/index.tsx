import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link'
import styled from 'styled-components';
import Select, { MultiValue } from 'react-select';
import ScrollableAnchor from '../../../vendored/react-scrollable-anchor/index';
import {Tooltip} from 'react-tooltip-v5';
import { useFilterOptions } from './useFilterOptions';
import { useSortAndFilter } from "./useSortAndFilter";
import { useDataFetch } from "./useDataFetch";
import {Spinner} from '../Spinner/Spinner';
import { ResourceGroup } from './ResourceGroup';
import { ErrorContainer } from "../../pages/404";
import { TooltipWrapper } from "./IndividualResource";
import {ResourceModal, SetModalResourceContext} from "./Modal";
import { Showcase, useShowcaseCards} from "./Showcase";
import { Card, FilterOption, Group, GroupDisplayNames, QuickLink, Resource } from './types';

interface ListResourcesProps extends ListResourcesResponsiveProps {
  elWidth: number
}

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
  defaultGroupLinks=false,
  groupDisplayNames,
  showcase,
}: ListResourcesProps) {
  const {groups, dataFetchError} = useDataFetch(sourceId, versioned, defaultGroupLinks, groupDisplayNames);
  const showcaseCards = useShowcaseCards(showcase, groups);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<readonly FilterOption[]>([]);
  const [sortMethod, changeSortMethod] = useState("alphabetical");
  const [resourceGroups, setResourceGroups] = useState<Group[]>([]);
  useSortAndFilter(sortMethod, selectedFilterOptions, groups, setResourceGroups)
  const availableFilterOptions = useFilterOptions(resourceGroups);
  const [modalResource, setModalResource ] = useState<Resource>();

  if (dataFetchError) {
    return (
      <ErrorContainer>  
        {"Whoops - listing resources isn't working!"}
        <br/>
        {'Please '}<Link href="/contact" style={{fontWeight: 300}}>get in touch</Link>{" if this keeps happening"}
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

      <SetModalResourceContext.Provider value={setModalResource}>
        <ScrollableAnchor id={LIST_ANCHOR}>
          <div>
            {resourceGroups.map((group) => (
              <ResourceGroup key={group.groupName}
                group={group} quickLinks={quickLinks}
                elWidth={elWidth}
                numGroups={resourceGroups.length}
                sortMethod={sortMethod}
              />
            ))}
          </div>
        </ScrollableAnchor>
      </SetModalResourceContext.Provider>

      <Tooltip style={{fontSize: '1.6rem'}} id="listResourcesTooltip"/>

      { versioned && (
        <ResourceModal resource={modalResource} dismissModal={() => setModalResource(undefined)}/>
      )}

    </ListResourcesContainer>
  )
}


interface ListResourcesResponsiveProps {
  sourceId: string
  versioned: boolean
  quickLinks: QuickLink[]

  /** Should the group name itself be a url? (which we let the server redirect) */
  defaultGroupLinks: boolean
  groupDisplayNames: GroupDisplayNames
  showcase: Card[]
}

/**
 * A wrapper element which monitors for resize events affecting the dom element.
 * Because of the responsive CSS design in parent components, most of the time
 * this only fires as we cross the specified thresholds so there's no need to
 * debounce. However when we are below the smallest threshold (currently 768px)
 * the resizes happen frequently and debouncing would be better. From limited
 * testing it's not too slow and these resizes should be infrequent.
 */
function ListResourcesResponsive(props: ListResourcesResponsiveProps) {
  const ref = useRef(null);
  const [elWidth, setElWidth] = useState<number>(0);
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

interface FilterProps {
  options: FilterOption[]
  selectedFilterOptions: readonly FilterOption[]
  setSelectedFilterOptions: React.Dispatch<React.SetStateAction<readonly FilterOption[]>>
}

function Filter({options, selectedFilterOptions, setSelectedFilterOptions}: FilterProps) {

  const onChange = (options: MultiValue<FilterOption>) => {
    if (options) {
      setSelectedFilterOptions(options)
    }
  };

  return (
    <div className="filter">
      <Select
        placeholder={"Filter by keywords in dataset names"}
        isMulti options={options}
        value={selectedFilterOptions}
        onChange={onChange}
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