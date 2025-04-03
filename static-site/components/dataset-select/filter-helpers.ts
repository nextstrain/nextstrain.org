/**
 * Code and components related to Filtering.
 * Most code and logic was originally lifted from Auspice
 */

import { sortBy } from 'lodash';

export function computeFilterValues(currentFilters, availableFilterValues, mode, trait, values) {
  let newValues;
  const currentlyFilteredTraits = Reflect.ownKeys(currentFilters);

  /* restrict the values we are attempting to add/inactivate etc to those which are valid */
  const availableFilterValuesSet = new Set(availableFilterValues.map((arr) => arr.join("__")));
  const validValues = values.filter((value) =>
    availableFilterValuesSet.has(`${trait}__${value}`)
  );
  if (!validValues.length) return false;

  switch (mode) {
    case "set":
      newValues = validValues.map((value) => ({value, active: true}));
      break;
    case "add":
      if (currentlyFilteredTraits.indexOf(trait) === -1) {
        newValues = validValues.map((value) => ({value, active: true}));
      } else {
        newValues = currentFilters[trait].slice();
        const currentItemNames = newValues.map((i) => i.value);
        validValues.forEach((valueToAdd) => {
          const idx = currentItemNames.indexOf(valueToAdd);
          if (idx === -1) {
            newValues.push({value: valueToAdd, active: true});
          } else {
            /* it's already there, ensure it's active */
            newValues[idx].active = true;
          }
        });
      }
      break;
    case "remove": // fallthrough
    case "inactivate": {
      if (currentlyFilteredTraits.indexOf(trait) === -1) {
        console.error(`trying to ${mode} values from an un-initialised filter!`);
        return false;
      }
      newValues = currentFilters[trait].slice();
      const currentItemNames = newValues.map((i) => i.value);
      for (const item of validValues) {
        const idx = currentItemNames.indexOf(item);
        if (idx !== -1) {
          if (mode==="remove") {
            newValues.splice(idx, 1);
          } else {
            newValues[idx].active = false;
          }
        } else {
          console.error(`trying to ${mode} filter value ${item} which was not part of the filter selection`);
        }
      }
      break;
    }
    default:
      console.error(`computeFilterValues called with invalid mode: ${mode}`);
      return false; // don't set state
  }
  const filters = Object.assign({}, currentFilters, {});
  filters[trait] = newValues;
  return filters;
}

/**
 * Given a list of datasets and columns (intended for display), create available options for
 * selection in the dropdown.
 * Note that the first column (dataset) is special cased, and ` / `-split into keywords
 */
export function collectAvailableFilteringOptions(datasets, columns) {
  /**
   * The <Select> component needs an array of options to display (and search across). We compute this
   * by looping across each filter and calculating all valid options for each. This function runs
   * each time a filter is toggled on / off.
   */
  // Todo - this function should consider currently selected filters and exclude them
  const optionsObject = datasets
    .reduce((accumulator, dataset) => {
      const pairs = parseFiltersForDataset(dataset, columns);
      pairs.forEach(([filterType, filterValue]) => {
        // init `seenValues` if the `filterType` is novel
        if (!accumulator.seenValues[filterType]) {
          accumulator.seenValues[filterType] = new Set([]);
        }
        // add the filterValue to both `seenValues` and, if new, `options`
        if (accumulator.seenValues[filterType].has(filterValue.toLowerCase())) return;
        accumulator.seenValues[filterType].add(filterValue.toLowerCase());
        accumulator.options.push({label: `${filterType} → ${filterValue}`, value: [filterType, filterValue]});
      });
      return accumulator;
    }, {options: [], seenValues: {}});
  return sortBy(optionsObject.options, [(o) => o.label.toLowerCase()]);
}

function parseFiltersForDataset(dataset, columns) {
  const pairs = [];
  columns.forEach((column, idx) => {
    const filterType = idx===0 ? "keyword" : column.name;
    const filterValues = (idx===0 ?
      column.value(dataset).split(/\s?\/\s?/) :
      [column.value(dataset)]
    ).filter((v) => !!v);
    if (!filterValues.length) return;
    filterValues.forEach((filterValue) => {
      pairs.push([filterType, filterValue]);
    });
  });
  return pairs;
}

export function getFilteredDatasets(datasets, filters, columns, rowSort) {
  const activeFiltersPerType = {};
  Object.keys(filters).forEach((filterType) => {
    const pairs = [];
    filters[filterType].forEach((filterObject) => {
      if (filterObject.active) {
        pairs.push(`${filterType}__${filterObject.value}`);
      }
    });
    if (pairs.length) activeFiltersPerType[filterType] = pairs;
  });

  const filteredDatasets = datasets
    .filter((dataset) => dataset.url !== undefined)
    .filter((dataset) => {
      // a given dataset defines a number of filter select option pairs [filterType, filterValue].
      // For the currently active filterType(s) and corresponding values, at least one value _must_ be present in
      // the dataset for it to be valid (i.e. pass filtering)
      const datasetSelectOptions = new Set(
        parseFiltersForDataset(dataset, columns)
          .map((p) => p.join('__')) // same format as used in `activeFiltersPerType`;
      );
      return Object.values(activeFiltersPerType)
        .every((activeFilterPairList) =>
          activeFilterPairList.some((filterPair) => datasetSelectOptions.has(filterPair))
        );
    });

  // If we don't have a custom sort order, then we sort on filenames.
  // There is a long-standing TODO here as this relies on the filename property existing.
  const iteratees = rowSort ? rowSort : [(d) => d.filename.toLowerCase()];
  return sortBy(filteredDatasets, iteratees);
}
