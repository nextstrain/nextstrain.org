"use client";

import React, { useState } from "react";

import FilterDisplay from "./filter-display";
import {
  collectAvailableFilteringOptions,
  computeFilterValues,
  getFilteredDatasets,
} from "./filter-helpers";
import FilterSelect from "./filter-select";
import ListDatasets from "./list-datasets";
import { ApplyFilterType, DatasetSelectProps, FilterType } from "./types";

/**
 * <DatasetSelect> is a React Client Componentintended to render
 * datasets [0] and expose a filtering UI to dynamically restrict the
 * visible datasets.
 *
 * [0] Currently only datasets are rendered, but in the future
 *     narratives and other assets may be displayed
 */
export default function DatasetSelect({
  datasets,
  columns,
  rowSort,
  interfaces,
  title,
}: DatasetSelectProps): React.ReactElement {
  const [filters, setFilters] = useState<FilterType>({});

  const childrenToRender = interfaces || [
    "FilterSelect",
    "FilterDisplay",
    "ListDatasets",
  ];

  const filteredDatasets = getFilteredDatasets(
    datasets,
    filters,
    columns,
    rowSort,
  );

  // TODO we want it it say "filter narratives" if we are passing narratives as the filterable list
  if (!title) {
    title = "Filter Datasets";
  }

  const applyFilter: ApplyFilterType = (mode, trait, values) => {
    const availableFilterValues = collectAvailableFilteringOptions(
      datasets,
      columns,
    ).map((o) => o.value);

    const new_filters = computeFilterValues(
      filters,
      availableFilterValues,
      mode,
      trait,
      values,
    );

    if (new_filters) {
      setFilters(new_filters);
    }
  };

  return (
    <>
      {childrenToRender.map((Child) => {
        switch (Child) {
          case "FilterSelect": {
            return (
              <FilterSelect
                key={String(Object.keys(filters).length)}
                options={collectAvailableFilteringOptions(datasets, columns)}
                applyFilter={applyFilter}
                title={title}
              />
            );
          }
          case "FilterDisplay": {
            return (
              <FilterDisplay
                key="FilterDisplay"
                filters={filters}
                applyFilter={applyFilter}
              />
            );
          }
          case "ListDatasets": {
            return (
              <ListDatasets
                key="ListDatasets"
                columns={columns}
                datasets={filteredDatasets}
              />
            );
          }
          default:
            if (typeof Child === "function") {
              {
                return <Child key={Child.name} datasets={filteredDatasets} />;
              }
            }
            console.error("Unknown interface element passed to DatasetSelect");
            return null;
        }
      })}
    </>
  );
}
