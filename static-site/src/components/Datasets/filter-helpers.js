/**
 * Code and components related to Filtering.
 * Most code and logic was originally lifted from Auspice
 */

import {get, sortBy } from 'lodash';

export function computeFilterValues(currentFilters, mode, trait, values) {
  let newValues;
  const currentlyFilteredTraits = Reflect.ownKeys(currentFilters);
  switch (mode) {
    case "set":
      newValues = values.map((value) => ({value, active: true}));
      break;
    case "add":
      if (currentlyFilteredTraits.indexOf(trait) === -1) {
        newValues = values.map((value) => ({value, active: true}));
      } else {
        newValues = currentFilters[trait].slice();
        const currentItemNames = newValues.map((i) => i.value);
        values.forEach((valueToAdd) => {
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
    case "inactivate":
      if (currentlyFilteredTraits.indexOf(trait) === -1) {
        console.error(`trying to ${mode} values from an un-initialised filter!`);
        return false;
      }
      newValues = currentFilters[trait].slice();
      const currentItemNames = newValues.map((i) => i.value);
      for (const item of values) {
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
    default:
      console.error(`computeFilterValues called with invalid mode: ${mode}`);
      return false; // don't set state
  }
  const filters = Object.assign({}, currentFilters, {});
  filters[trait] = newValues;
  return filters;
}


/**
 * Todo - this function should consider currently selected filters and exclude them
 */
export function collectAvailableFilteringOptions(datasets) {
  /**
   * The <Select> component needs an array of options to display (and search across). We compute this
   * by looping across each filter and calculating all valid options for each. This function runs
   * each time a filter is toggled on / off.
   */
  const optionsObject = datasets
    .filter((b) => b.url !== undefined)
    .reduce((accumulator, dataset) => {
      const filename = get(dataset, "filename");
      const keywordArray = filename.replace('.json', '').split("_");
      keywordArray.forEach((keyword) => {
        if (accumulator.seenValues["keyword"]) {
          if (accumulator.seenValues["keyword"].has(keyword)) return;
        } else {
          accumulator.seenValues["keyword"] = new Set([]);
        }
        accumulator.seenValues["keyword"].add(keyword);
        accumulator.options.push({label: `keyword → ${keyword}`, value: ["keyword", keyword]});
      });
      return accumulator;
    }, {options: [], seenValues: {}});
  return sortBy(optionsObject.options, [(o) => o.label.toLowerCase()]);
}
