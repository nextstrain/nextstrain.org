/** A helper function used in several places by filtering code */
export type ApplyFilterType = (
  /** The filtering mode */
  mode: FilteringModeType,

  /** The trait (i.e., column name or "keyword") being operated on */
  trait: string,

  /** values to filter for */
  values: string[],
) => void;

/** An individual column displayed in a <DatasetSelect> component */
export interface DatasetSelectColumnsType {
  /** Name of the column */
  name: string;

  /** Callback to get the value of the column */
  value: (dataset: DatasetType) => string;

  /** Callback to get the URL to wrap around the value of the column */
  url?: (dataset: DatasetType) => string;

  /** Logo to display next to the contributor name (only used for Nextstrain(?)) */
  logo?: (dataset: DatasetType) => React.ReactElement | undefined;
}

/** The props of the <DatasetSelect> component */
export interface DatasetSelectProps {
  /** Available datasets */
  datasets: DatasetType[];

  /** Columns to be rendered by the table */
  columns: DatasetSelectColumnsType[];

  /** How the rows should be sorted in the table. See lodash's sortBy for details. */
  rowSort?: RowSortType;

  /**
   * What elements to render? Elements may be strings or functinos.
   * Order is respected.
   *
   * Available strings: "FilterSelect" "FilterDisplay",
   * "ListDatasets"; default value is to render all three in that
   * order.
   *
   * Functions will be handed an object with key(s): `datasets` (which
   * may be filtered), and should return a react component for
   * rendering.
   */
  interfaces?: DatasetSelectInterfacesType[];

  /** Title to display above the DatasetSelect */
  title?: string;
}

/** A individual dataset to be displayed in a <DatasetSelect> component */
export interface DatasetType {
  /** filename of the dataset -- only used in SARS datasets */
  filename?: string;

  /** URL where the dataset is found */
  url: string;

  /** Version of the URL to display in the <DatasetSelect> -- only used in Community datasets */
  urlDisplayName?: string;

  /** Name of the dataset */
  name?: string;

  /** Name(s) of the contributor(s) that built the dataset */
  contributor?: string;

  /** URL for the contributors(s) that built the dataset -- only used in SARS datasets */
  contributorUrl?: string;

  /** Long/lat for the location of the dataset -- only used in SARS datasets */
  coords?: [number, number];

  /** Organization that built the dataset -- only used in SARS datasets */
  org?: {
    name?: string;
    url: string;
  };

  /** geographical level / scope of dataset -- only used in SARS datasets */
  level?: "region" | "country" | "division" | "location";
}

/** The different potential UI elements displayed by a <DatasetSelect> component */
export type DatasetSelectInterfacesType =
  | "FilterSelect"
  | "FilterDisplay"
  | "ListDatasets"
  | ((props: { datasets: DatasetType[] }) => React.ReactElement);

/** Filter categories and associated badges */
export interface FilterCategoryType {
  /** Name of the filter */
  name: string;

  /** List of badges associate with the filter */
  badges: React.ReactElement[];
}

/** Filtering mode */
export type FilteringModeType = "set" | "add" | "remove" | "inactivate";

/** Filtering options */
export interface FilteringOptionsType {
  /** name of the option */
  label: string;

  /** tuple mapping filtering option to value */
  value: [string, string];
}

/** Props for the <FilterSelect> component */
export interface FilterSelectProps {
  /** Available options */
  options: FilteringOptionsType[];

  /** Helper function that applies the filter */
  applyFilter: ApplyFilterType;

  /** Title of the filter */
  title: string;
}

/** A filter for one or more values */
export type FilterType = Record<
  /**
   * The key of the Record is either "keyword" or the name of the
   * column, taken from a DatasetSelectColumnsType
   */
  string,
  /** A single filter */
  SingleFilterType[]
>;

/** An entry in the <Legend> component */
export interface LegendEntryType {
  /** Unique id */
  id: string;

  /** Icon to display for the entry */
  icon: React.ReactElement;

  /** Text string for the entry */
  label: string;

  /** Tooltip info for the entry */
  info: string;
}

/** A single filter */
export interface SingleFilterType {
  /** is the filter active? */
  active: boolean;

  /** a value to filter for */
  value: string;
}

/**
 * The type of the `rowSort` prop in <DatasetSelect>
 *
 * As far as I can tell, as of 31 March 2025, this property is never
 * actually set to anything, so I'm not sure what the most appropriate
 * type is — the one time it _is_ set to something, it is `[]` — so
 * `unknown[]` is the best guess I have.
 *
 * TODO consider removing the prop
 */
export type RowSortType = unknown[] | undefined;
