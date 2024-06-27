import React, { FormEvent, useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import styled from 'styled-components';
import Select, { MultiValue } from 'react-select';
import ScrollableAnchor, { goToAnchor } from '../../../vendored/react-scrollable-anchor/index';
import {Tooltip} from 'react-tooltip-v5';
import { createFilterOption, useFilterOptions } from './useFilterOptions';
import { useSortAndFilter } from "./useSortAndFilter";
import { useDataFetch } from "./useDataFetch";
import {Spinner} from '../Spinner/Spinner';
import { ResourceGroup } from './ResourceGroup';
import { ErrorContainer } from "../../pages/404";
import { TooltipWrapper } from "./IndividualResource";
import {ResourceModal, SetModalResourceContext} from "./Modal";
import { Showcase } from "../Showcase";
import { FilterCard, FilterOption, Group, QuickLink, Resource, ResourceListingInfo } from './types';
import { HugeSpacer } from "../../layouts/generalComponents";

interface ListResourcesProps extends ListResourcesResponsiveProps {
  elWidth: number
}

const LIST_ANCHOR = "list";

const SetSelectedFilterOptions = createContext<React.Dispatch<React.SetStateAction<readonly FilterOption[]>> | null>(null);

/**
 * A React component that uses a callback to fetch data about
 * available resources, and then display them, including past versions
 * ("snapshots"), if those exist.
 *
 * Note that currently this only uses 'dataset' resources. In the future this
 * will be expanded. Similarly, we define versioned: boolean here in the UI whereas
 * this may be better expressed as a property of the API response.
 */
function ListResources({
  versioned=true,
  elWidth,
  quickLinks,
  defaultGroupLinks=false,
  groupDisplayNames,
  showcase,
  resourceListingCallback: resourceListingCallback,
}: ListResourcesProps) {
  const {groups, dataFetchError} = useDataFetch(
    versioned,
    defaultGroupLinks,
    groupDisplayNames,
    resourceListingCallback,
  );
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
        {'Please '}<a href="/contact" style={{fontWeight: 300}}>get in touch</a>{" if this keeps happening"}
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

      { showcaseCards.length > 0 && (
        <>
        <Byline>
          Showcase resources: click to filter the resources to a pathogen
        </Byline>

        <SetSelectedFilterOptions.Provider value={setSelectedFilterOptions}>
          <Showcase cards={showcaseCards} cardWidth={cardWidthHeight} cardHeight={cardWidthHeight} CardComponent={FilterShowcaseTile} />
        </SetSelectedFilterOptions.Provider>
        </>
      )}

      <Filter options={availableFilterOptions} selectedFilterOptions={selectedFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>

      { groups?.[0]?.lastUpdated && (
        <SortOptions sortMethod={sortMethod} changeSortMethod={changeSortMethod}/>
      ) || (
        <HugeSpacer/>
      )}

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
  versioned: boolean
  quickLinks: QuickLink[]

  /** Should the group name itself be a url? (which we let the server redirect) */
  defaultGroupLinks: boolean

  /** Mapping from group name -> display name */
  groupDisplayNames: Record<string, string>
  showcase: FilterCard[]
  resourceListingCallback: () => Promise<ResourceListingInfo>;
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
      if (entry) {
        // don't do anything if entry is undefined
        setElWidth(entry.contentRect.width);
      }
    });
    if (ref.current) {
      // don't do anything if ref is undefined
      observer.observe(ref.current);
    }
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
  function onChangeValue(event:FormEvent<HTMLInputElement>): void {
    changeSortMethod(event.currentTarget.value);
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

const Byline = styled.div`
  font-size: 1.6rem;
  border-top: 1px rgb(230, 230, 230) solid;
`


/*** SHOWCASE ***/

const FilterShowcaseTile = ({ card }: { card: FilterCard }) => {
  const setSelectedFilterOptions = useContext(SetSelectedFilterOptions);

  if (!setSelectedFilterOptions) {
    throw new Error("Usage of this component requires the SetSelectedFilterOptions context to be set.")
  }

  const filter = useCallback(
    () => {
      setSelectedFilterOptions(card.filters.map(createFilterOption));
      goToAnchor(LIST_ANCHOR);
    },
    [setSelectedFilterOptions, card]
  )

  return (
    <CardOuter>
      <CardInner>
        <div onClick={filter}>
          <CardTitle $squashed>
            {card.name}
          </CardTitle>
          <CardImgWrapper filename={card.img}/>
        </div>
      </CardInner>
    </CardOuter>
  )
}


/**
 * Given a set of user-defined cards, restrict them to the set of cards for
 * which the filters are valid given the resources known to the resource listing
 * UI
 */
const useShowcaseCards = (cards?: FilterCard[], groups?: Group[]) => {
  const [restrictedCards, setRestrictedCards] = useState<FilterCard[]>([]);
  useEffect(() => {
    if (!cards || !groups) return;
    const words = groups.reduce((words, group) => {
      for (const resource of group.resources) {
        for (const word of resource.nameParts) {
          words.add(word);
        }
      }
      return words;
    }, new Set<string>());
    setRestrictedCards(cards.filter((card) => {
      return card.filters.every((word) => words.has(word))
    }));
  }, [cards, groups]);
  return restrictedCards;
}

const cardWidthHeight = 160; // pixels

const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-width: ${cardWidthHeight}px;
  min-height: ${cardWidthHeight}px;
  max-width: ${cardWidthHeight}px;
  max-height: ${cardWidthHeight}px;
`

const CardInner = styled.div`
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`;

const CardTitle = styled.div<{$squashed: boolean}>`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: ${(props) => props.$squashed ? "21px" : "25px"};
  @media (max-width: 768px) {
    font-size: 22px;
  }
  position: absolute;
  border-radius: 3px;
  padding: 10px 20px 10px 10px;
  top: 15px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`;

const CardImg = styled.img`
  object-fit: contain;
  border-radius: 2px;
  max-height: 100%;
  width: 100%;
  float: right;
`;

const CardImgWrapper = ({filename}) => {
  let src;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/${filename}`).default.src;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/empty.png`).default.src;
  }
  return <CardImg src={src} alt={""} />
}
