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
import { ExpandableTiles } from "../ExpandableTiles";
import { FilterTile, FilterOption, Group, QuickLink, Resource, ResourceListingInfo, SortMethod, convertVersionedResource } from './types';
import { HugeSpacer } from "../../layouts/generalComponents";
import { ErrorBoundary, InternalError } from '../ErrorBoundary';

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
  tileData,
  resourceListingCallback: resourceListingCallback,
}: ListResourcesResponsiveProps & {
  elWidth: number
}) {
  const {groups, dataFetchError} = useDataFetch(
    versioned,
    defaultGroupLinks,
    groupDisplayNames,
    resourceListingCallback,
  );
  const tiles = useTiles(tileData, groups);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<readonly FilterOption[]>([]);
  const [sortMethod, changeSortMethod] = useState<SortMethod>("alphabetical");
  const [resourceGroups, setResourceGroups] = useState<Group[]>([]);
  useSortAndFilter(sortMethod, selectedFilterOptions, setResourceGroups, groups)
  const availableFilterOptions = useFilterOptions(resourceGroups);
  const [modalResource, setModalResource ] = useState<Resource>();

  if (dataFetchError) {
    return (
      <ErrorContainer>
        {"Whoops - listing resources isn't working!"}
        <br/>
        {"Please "}<a href="/contact" style={{fontWeight: 300}}>get in touch</a>{" if this keeps happening"}
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

      { tiles.length > 0 && (
        <>
        <Byline>
          All pathogens: click a pathogen to filter
        </Byline>

        <SetSelectedFilterOptions.Provider value={setSelectedFilterOptions}>
          <ExpandableTiles
            tiles={tiles.sort((a, b) => a.name.localeCompare(b.name))}
            tileWidth={tileWidthHeight}
            tileHeight={tileWidthHeight}
            TileComponent={Tile}
          />
        </SetSelectedFilterOptions.Provider>
        </>
      )}

      <Filter options={availableFilterOptions} selectedFilterOptions={selectedFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>

      { versioned && (
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

      { versioned && modalResource && (
        <ResourceModal resource={convertVersionedResource(modalResource)} dismissModal={() => setModalResource(undefined)}/>
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
  tileData: FilterTile[]
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
    <ErrorBoundary>
      <div ref={ref}>
        <ListResources {...props} elWidth={elWidth}/>
      </div>
    </ErrorBoundary>
  )
}

export default ListResourcesResponsive


function SortOptions({sortMethod, changeSortMethod}: {
  sortMethod: SortMethod,
  changeSortMethod: React.Dispatch<React.SetStateAction<SortMethod>>,
}) {
  function onChangeValue(event: FormEvent<HTMLInputElement>): void {
    const sortMethod = event.currentTarget.value;
    if (sortMethod !== "alphabetical" &&
        sortMethod !== "lastUpdated") {
      throw new InternalError(`Unhandled sort method: '${sortMethod}'`);
    }
    changeSortMethod(sortMethod);
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

function Filter({
  options,
  selectedFilterOptions,
  setSelectedFilterOptions,
}: {
  options: FilterOption[]
  selectedFilterOptions: readonly FilterOption[]
  setSelectedFilterOptions: React.Dispatch<React.SetStateAction<readonly FilterOption[]>>
}) {

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


/*** TILES ***/

const Tile = ({ tile }: { tile: FilterTile }) => {
  const setSelectedFilterOptions = useContext(SetSelectedFilterOptions);

  if (!setSelectedFilterOptions) {
    throw new Error("Usage of this component requires the SetSelectedFilterOptions context to be set.")
  }

  const filter = useCallback(
    () => {
      setSelectedFilterOptions(tile.filters.map(createFilterOption));
      goToAnchor(LIST_ANCHOR);
    },
    [setSelectedFilterOptions, tile]
  )

  return (
    <TileOuter>
      <TileInner>
        <div onClick={filter}>
          <TileName $squashed>
            {tile.name}
          </TileName>
          <TileImgWrapper filename={tile.img}/>
        </div>
      </TileInner>
    </TileOuter>
  )
}


/**
 * Given a set of user-defined tiles, restrict them to the set of tiles for
 * which the filters are valid given the resources known to the resource listing
 * UI
 */
const useTiles = (tiles?: FilterTile[], groups?: Group[]) => {
  const [restrictedTiles, setRestrictedTiles] = useState<FilterTile[]>([]);
  useEffect(() => {
    if (!tiles || !groups) return;
    const words = groups.reduce((words, group) => {
      for (const resource of group.resources) {
        for (const word of resource.nameParts) {
          words.add(word);
        }
      }
      return words;
    }, new Set<string>());
    setRestrictedTiles(tiles.filter((tile) => {
      return tile.filters.every((word) => words.has(word))
    }));
  }, [tiles, groups]);
  return restrictedTiles;
}

const tileWidthHeight = 160; // pixels

const TileOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-width: ${tileWidthHeight}px;
  min-height: ${tileWidthHeight}px;
  max-width: ${tileWidthHeight}px;
  max-height: ${tileWidthHeight}px;
`

const TileInner = styled.div`
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`;

const TileName = styled.div<{$squashed: boolean}>`
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

const TileImg = styled.img`
  object-fit: contain;
  border-radius: 2px;
  max-height: 100%;
  width: 100%;
  float: right;
`;

const TileImgWrapper = ({filename}) => {
  let src;
  try {
    src = require(`../../../static/pathogen_images/${filename}`).default.src;
  } catch {
    src = require(`../../../static/pathogen_images/empty.png`).default.src;
  }
  return <TileImg src={src} alt={""} />
}
