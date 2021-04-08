import React from "react";
import "react-select/dist/react-select.css";
import "react-virtualized-select/styles.css";
import { get, sortBy } from 'lodash';
import { DatasetFilteringSelection } from "./filter-selection";
import { ListDatasets } from "./list-datasets";
import { FilterDisplay } from "./filter-display";
import { collectAvailableFilteringOptions, computeFilterValues } from "./filter-helpers";

/**
 * <FilterData> is a (keyboard)-typing based search box intended to
 * allow users to filter samples. The filtering rules are not implemented
 * in this component, but are useful to spell out: we take the union of
 * entries within each category and then take the intersection of those unions.
 */
class DatasetSelect extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      filters: {},
    };
    this.applyFilter = (mode, trait, values) => {
      const availableFilterValues = collectAvailableFilteringOptions(this.props.datasets).map((o) => o.value);
      const filters = computeFilterValues(this.state.filters, availableFilterValues, mode, trait, values);
      if (filters) this.setState({filters});
    };
    this.getFilteredDatasets = this.getFilteredDatasets.bind(this);
  }

  componentDidMount() {
    if (!this.props.urlDefinedFilterPath) return;
    const filterValues = this.props.urlDefinedFilterPath
      .split("/")           // how keywords are separated in the URL
      .filter((x) => !!x);  // remove any empty strings
    this.applyFilter("add", "keyword", filterValues);
  }

  buildMatchesFilter(build, filterName, filterObjects) {
    const keywordArray = get(build, "filename").replace('.json', '').split("_");
    return filterObjects.every((filter) => {
      if (!filter.active) return true; // inactive filter is the same as a match
      return keywordArray.includes(filter.value);
    });
  }

  getFilteredDatasets() {
    // TODO this doesn't care about categories
    const filtered = this.props.datasets
      .filter((b) => b.url !== undefined)
      .filter((b) => Object.entries(this.state.filters)
        .filter((filterEntry) => filterEntry[1].length)
        .every(([filterName, filterValues]) => this.buildMatchesFilter(b, filterName, filterValues)));
    return sortBy(filtered, [(d) => d.filename.toLowerCase()]);
  }

  render() {
    // options only need to be calculated a single time per render, and by adding a debounce
    // to `loadFilterOptions` we don't slow things down by comparing queries to a large number of options
    return (
      <>
        <DatasetFilteringSelection
          key={String(Object.keys(this.state.filters).length)}
          datasets={this.props.datasets}
          applyFilter={this.applyFilter}
        />
        <FilterDisplay
          filters={this.state.filters}
          applyFilter={this.applyFilter}
        />
        <ListDatasets
          datasets={this.getFilteredDatasets()}
          showDates={!this.props.noDates}
        />
      </>
    );
  }
}

export default DatasetSelect;
