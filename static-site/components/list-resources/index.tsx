"use client";

import React, {
  FormEvent,
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import Select, { MultiValue } from "react-select";
import { Tooltip } from "react-tooltip-v5";

import ScrollableAnchor, {
  goToAnchor,
} from "../../vendored/react-scrollable-anchor/index";

import { ErrorBoundary, InternalError } from "../error-boundary";
import ExpandableTiles from "../expandable-tiles";
import { HugeSpacer } from "../spacers";
import Spinner from "../spinner";

import { ResourceModal, SetModalResourceContext } from "./modal";
import ResourceGroup from "./resource-group";
import TooltipWrapper from "./tooltip-wrapper";
import { createFilterOption, useFilterOptions } from "./use-filter-options";
import useSortAndFilter from "./use-sort-and-filter";
import useDataFetch from "./use-data-fetch";

import {
  FilterTile,
  FilterOption,
  Group,
  QuickLink,
  Resource,
  ResourceListingInfo,
  SortMethod,
  convertVersionedResource,
} from "./types";

import styles from "./styles.module.css";

interface ListResourcesProps {
  /** Is the resource versioned? */
  versioned: boolean;

  /** Set of quick links associated with the resource */
  quickLinks: QuickLink[];

  /**
   * Should the group name itself be a url? (which we let the server
   * redirect)
   */
  defaultGroupLinks: boolean;

  /** Mapping from group name -> display name */
  groupDisplayNames: Record<string, string>;

  /** Metadata about the tile */
  tileData: FilterTile[];

  /** Callback to use to get data */
  resourceListingCallback: () => Promise<ResourceListingInfo>;

  /** This is currently unused */
  resourceType: string;
}

/** The name of the anchor that represents the top of the resource listing */
const LIST_ANCHOR = "list";

/** The height and width of an individual tile, in pixels */
const tileWidthHeight = 160;

/** A React Context to support the manipulation of filter options */
const SetSelectedFilterOptions = createContext<React.Dispatch<
  React.SetStateAction<readonly FilterOption[]>
> | null>(null);

/**
 * A React Client Component which monitors for resize events affecting
 * the DOM element it wraps. Because of the responsive CSS design in
 * the parent components, most of the time this only fires when we
 * cross the specified thresholds, so there's no need to debounce.
 * However when we are below the smallest threshold (currently 768px),
 * the resizes happen frequently and debouncing would be better. From
 * limited testing it's not too slow and these resizes should be
 * infrequent.
 */
export default function ListResources(
  /** see the `ListResourceProps` interface for details */
  props: ListResourcesProps,
): React.ReactElement {
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

    return (): void => {
      observer.disconnect();
    };
  }, []);

  return (
    <ErrorBoundary>
      <div ref={ref}>
        <ListResourcesContent {...props} elWidth={elWidth} />
      </div>
    </ErrorBoundary>
  );
}

/**
 * A React Client Component that uses a callback to fetch data about
 * available resources, and then display them, including past versions
 * ("snapshots"), if those exist.
 *
 * Note that currently this only uses 'dataset' resources. In the
 * future this will be expanded. Similarly, we define versioned:
 * boolean here in the UI whereas this may be better expressed as a
 * property of the API response.
 */
function ListResourcesContent({
  versioned = true,
  elWidth,
  quickLinks,
  defaultGroupLinks = false,
  groupDisplayNames,
  tileData,
  resourceListingCallback,
}: ListResourcesProps & {
  /** width of the element */
  elWidth: number;
}): React.ReactElement {
  const { groups, dataFetchError } = useDataFetch(
    versioned,
    defaultGroupLinks,
    groupDisplayNames,
    resourceListingCallback,
  );

  const tiles = useTiles(tileData, groups);

  const [selectedFilterOptions, setSelectedFilterOptions] = useState<
    readonly FilterOption[]
  >([]);

  const [sortMethod, changeSortMethod] = useState<SortMethod>("alphabetical");

  const [resourceGroups, setResourceGroups] = useState<Group[]>([]);

  useSortAndFilter(
    sortMethod,
    selectedFilterOptions,
    setResourceGroups,
    groups,
  );

  const availableFilterOptions = useFilterOptions(resourceGroups);

  const [modalResource, setModalResource] = useState<Resource>();

  if (dataFetchError) {
    return (
      <div className="errorContainer">
        {"Whoops - listing resources isn't working!"}
        <br />
        Please <a href="/contact">get in touch</a> if this keeps happening
      </div>
    );
  }

  if (!resourceGroups?.length) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={styles.listResourcesContainer}>
      {tiles.length > 0 && (
        <>
          <div className={styles.byline}>
            All pathogens: click a pathogen to filter
          </div>

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

      <Filter
        options={availableFilterOptions}
        selectedFilterOptions={selectedFilterOptions}
        setSelectedFilterOptions={setSelectedFilterOptions}
      />

      {(versioned && (
        <SortOptions
          sortMethod={sortMethod}
          changeSortMethod={changeSortMethod}
        />
      )) || <HugeSpacer />}

      <SetModalResourceContext.Provider value={setModalResource}>
        <ScrollableAnchor id={LIST_ANCHOR}>
          <div>
            {resourceGroups.map((group) => (
              <ResourceGroup
                key={group.groupName}
                group={group}
                quickLinks={quickLinks}
                elWidth={elWidth}
                numGroups={resourceGroups.length}
                sortMethod={sortMethod}
              />
            ))}
          </div>
        </ScrollableAnchor>

        <div className={styles.relativePos}>
          <Tooltip
            className={styles.resourceTooltip}
            id="listResourcesTooltip"
          />
        </div>

        {versioned && modalResource && (
          <ResourceModal resource={convertVersionedResource(modalResource)} />
        )}
      </SetModalResourceContext.Provider>
    </div>
  );
}

/**
 * A React Client component that provides a way to filter the
 * displayed resources.
 */
function Filter({
  options,
  selectedFilterOptions,
  setSelectedFilterOptions,
}: {
  /** list of available `FilterOption` objects */
  options: FilterOption[];

  /** readonly list of active `FilterOption` objects*/
  selectedFilterOptions: readonly FilterOption[];

  /** React State setter for the active `FilterOption` objects*/
  setSelectedFilterOptions: React.Dispatch<
    React.SetStateAction<readonly FilterOption[]>
  >;
}): React.ReactElement {
  const onChange = (options: MultiValue<FilterOption>) => {
    if (options) {
      setSelectedFilterOptions(options);
    }
  };

  return (
    <div className="filter">
      <Select
        placeholder={"Filter by keywords in dataset names"}
        isMulti
        options={options}
        value={selectedFilterOptions}
        onChange={onChange}
        styles={{
          // https://react-select.com/styles#inner-components
          placeholder: (baseStyles) => ({ ...baseStyles, fontSize: "1.6rem" }),
          input: (baseStyles) => ({ ...baseStyles, fontSize: "1.6rem" }),
          option: (baseStyles) => ({ ...baseStyles, fontSize: "1.4rem" }),
          multiValue: (baseStyles) => ({
            ...baseStyles,
            fontSize: "1.6rem",
            backgroundColor: "#f4d5b7",
          }),
        }}
      />
    </div>
  );
}

/**
 * A React Client Component with controls for how the displayed
 * resources are sorted.
 */
function SortOptions({
  sortMethod,
  changeSortMethod,
}: {
  /** the `SortMethod` to use */
  sortMethod: SortMethod;

  /** React State setter for the `SortMethod` */
  changeSortMethod: React.Dispatch<React.SetStateAction<SortMethod>>;
}): React.ReactElement {
  /** helper function for managing changes to the sort method */
  function onChangeValue(event: FormEvent<HTMLInputElement>): void {
    const sortMethod = event.currentTarget.value;
    if (sortMethod !== "alphabetical" && sortMethod !== "lastUpdated") {
      throw new InternalError(`Unhandled sort method: '${sortMethod}'`);
    }
    changeSortMethod(sortMethod);
  }

  return (
    <div className={styles.sortContainer}>
      Sort pathogens by:
      <input
        checked={"alphabetical" === sortMethod}
        id="alphabetical"
        onChange={onChangeValue}
        style={{
          cursor: "alphabetical" === sortMethod ? "default" : "pointer",
        }}
        type="radio"
        value="alphabetical"
      />
      <TooltipWrapper
        description={
          "Pathogen groups ordered alphabetically. " +
          "<br/>" +
          "Datasets within each group ordered alphabetically."
        }
      >
        <label
          htmlFor="alphabetical"
          style={{
            cursor: "alphabetical" === sortMethod ? "default" : "pointer",
          }}
        >
          alphabetical
        </label>
      </TooltipWrapper>
      <input
        checked={"lastUpdated" === sortMethod}
        id="lastUpdated"
        onChange={onChangeValue}
        style={{ cursor: "lastUpdated" === sortMethod ? "default" : "pointer" }}
        type="radio"
        value="lastUpdated"
      />
      <TooltipWrapper
        description={
          "Pathogen groups ordered by the most recently updated dataset within that group. " +
          "<br/>" +
          "Datasets within each group ordered by their latest update date."
        }
      >
        <label
          htmlFor="lastUpdated"
          style={{
            cursor: "lastUpdated" === sortMethod ? "default" : "pointer",
          }}
        >
          most recently updated
        </label>
      </TooltipWrapper>
    </div>
  );
}

/**
 * A React Client Component for displaying a single `Tile` object
 */
function Tile({
  tile,
}: {
  /** the `FilterTile` object to display */
  tile: FilterTile;
}): React.ReactElement {
  const setSelectedFilterOptions = useContext(SetSelectedFilterOptions);
  if (!setSelectedFilterOptions) {
    throw new Error(
      "Usage of this component requires the SetSelectedFilterOptions context to be set.",
    );
  }

  const filter: () => void = useCallback((): void => {
    setSelectedFilterOptions(tile.filters.map(createFilterOption));
    goToAnchor(LIST_ANCHOR);
  }, [setSelectedFilterOptions, tile]);

  return (
    <div
      className={styles.tileOuter}
      style={{
        minWidth: `${tileWidthHeight}px`,
        minHeight: `${tileWidthHeight}px`,
        maxWidth: `${tileWidthHeight}px`,
        maxHeight: `${tileWidthHeight}px`,
      }}
    >
      <div className={styles.tileInner}>
        <div onClick={filter}>
          <div className={styles.tileName}>{tile.name}</div>
          <TileImgWrapper filename={tile.img} />
        </div>
      </div>
    </div>
  );
}

/** React Client Component for the image displayed on a `Tile` */
function TileImgWrapper({
  filename,
}: {
  /**
   * the file name of the image file to display expected to be within
   * the `pathogen_images` directory
   */
  filename: string;
}): React.ReactElement {
  let src: string;
  try {
    src = require(`../../static/pathogen_images/${filename}`).default.src;
  } catch {
    src = require(`../../static/pathogen_images/empty.png`).default.src;
  }

  return <img className={styles.tileImg} src={src} alt={""} />;
}

/**
 * Given a set of user-defined tiles, restrict them to the set of
 * tiles for which the filters are valid given the resources known to
 * the resource listing UI
 */
function useTiles(tiles?: FilterTile[], groups?: Group[]): FilterTile[] {
  const [restrictedTiles, setRestrictedTiles] = useState<FilterTile[]>([]);

  useEffect(() => {
    if (!tiles || !groups) {
      return;
    }

    const words = groups.reduce((words, group) => {
      for (const resource of group.resources) {
        for (const word of resource.nameParts) {
          words.add(word);
        }
      }
      return words;
    }, new Set<string>());

    setRestrictedTiles(
      tiles.filter((tile) => {
        return tile.filters.every((word) => words.has(word));
      }),
    );
  }, [tiles, groups]);

  return restrictedTiles;
}
