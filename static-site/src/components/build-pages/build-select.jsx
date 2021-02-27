import React from "react";
import "react-select/dist/react-select.css";
import "react-virtualized-select/styles.css";
import Select from "react-virtualized-select";
import { debounce, get } from 'lodash';
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { FaInfoCircle } from "react-icons/fa";
import { FilterBadge, Tooltip } from "./filterBadge";
import buildLink from "./build-link";
import * as splashStyles from "../splash/styles";

const StyledTooltip = styled(ReactTooltip)`
  max-width: 30vh;
  white-space: normal;
  line-height: 1.2;
  padding: 10px !important; /* override internal styling */
  z-index: 1002 !important; /* on top of viz legend */
  pointer-events: auto !important;
`;

const Intersect = ({id}) => (
  <span style={{fontSize: "2rem", fontWeight: 300, padding: "0px 4px 0px 2px", cursor: 'help'}} data-tip data-for={id}>
    ∩
    <Tooltip id={id}>{`Groups of filters are combined by intersection`}</Tooltip>
  </span>
);
const Union = () => (
  <span style={{fontSize: "1.5rem", padding: "0px 3px 0px 2px"}}>
    ∪
  </span>
);
const openBracketBig = <span style={{fontSize: "2rem", fontWeight: 300, padding: "0px 0px 0px 2px"}}>{'{'}</span>;
const closeBracketBig = <span style={{fontSize: "2rem", fontWeight: 300, padding: "0px 2px"}}>{'}'}</span>;
const openBracketSmall = <span style={{fontSize: "1.8rem", fontWeight: 300, padding: "0px 2px"}}>{'{'}</span>;
const closeBracketSmall = <span style={{fontSize: "1.8rem", fontWeight: 300, padding: "0px 2px"}}>{'}'}</span>;

const DEBOUNCE_TIME = 200;

/**
 * <FilterData> is a (keyboard)-typing based search box intended to
 * allow users to filter samples. The filtering rules are not implemented
 * in this component, but are useful to spell out: we take the union of
 * entries within each category and then take the intersection of those unions.
 */
class FilterBuilds extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {}
    };
    this.applyFilter = this.applyFilter.bind(this);
    this.createFilterBadges = this.createFilterBadges.bind(this);
    this.getStyles = this.getStyles.bind(this);
    this.makeOptions = this.makeOptions.bind(this);
    this.selectionMade = this.selectionMade.bind(this);
    this.createIndividualBadge = this.createIndividualBadge.bind(this);
    this.getFilteredBuilds = this.getFilteredBuilds.bind(this);
  }

  applyFilter = (mode, trait, values) => {
    const currentlyFilteredTraits = Reflect.ownKeys(this.state.filters);
    let newValues;
    switch (mode) {
      case "set":
        newValues = values.map((value) => ({value, active: true}));
        break;
      case "add":
        if (currentlyFilteredTraits.indexOf(trait) === -1) {
          newValues = values.map((value) => ({value, active: true}));
        } else {
          newValues = this.state.filters[trait].slice();
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
          return;
        }
        newValues = this.state.filters[trait].slice();
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
        console.error(`applyFilter called with invalid mode: ${mode}`);
        return; // don't set state
    }
    const filters = Object.assign({}, this.state.filters, {});
    filters[trait] = newValues;
    this.setState({filters});
  };

  getStyles() {
    return {
      base: {
        marginBottom: 0,
        fontSize: 14
      }
    };
  }
  makeOptions = () => {
    /**
     * The <Select> component needs an array of options to display (and search across). We compute this
     * by looping across each filter and calculating all valid options for each. This function runs
     * each time a filter is toggled on / off.
     */
    // TODO default filterPropertyMappings?
    const builds = this.props.builds.filter((b) => b.url !== undefined);
    const optionsObject = builds.reduce((accumulator, build) => {
      this.props.filterPropertyMappings.forEach(([propertyName, displayName]) => {
        const propertyValue = get(build, propertyName);
        if (propertyValue === undefined) return;
        if (accumulator.seenValues[propertyName]) {
          if (accumulator.seenValues[propertyName].has(propertyValue)) return;
        } else {
          accumulator.seenValues[propertyName] = new Set([]);
        }
        accumulator.seenValues[propertyName].add(propertyValue);
        accumulator.options.push({label: `${displayName} → ${propertyValue}`, value: [propertyName, propertyValue]});
      });
      return accumulator;
    }, {options: [], seenValues: {}});
    return optionsObject.options;
  }
  selectionMade = (sel) => {
    this.applyFilter("add", sel.value[0], [sel.value[1]]);
  }
  createIndividualBadge({filterName, item, label, onHoverMessage}) {
    return (
      <FilterBadge
        key={item.value}
        id={String(item.value)}
        remove={() => {this.applyFilter("remove", filterName, [item.value]);}}
        canMakeInactive
        onHoverMessage={onHoverMessage}
        active={item.active}
        activate={() => {this.applyFilter("add", filterName, [item.value]);}}
        inactivate={() => {this.applyFilter("inactivate", filterName, [item.value]);}}
      >
        {label}
      </FilterBadge>
    );
  }
  createFilterBadges(filterName) {
    const nFilterValues = this.state.filters[filterName].length;
    const onHoverMessage = nFilterValues === 1 ?
      `Filtering datasets to this ${filterName}` :
      `Filtering datasets to these ${nFilterValues} ${filterName}`;
    return this.state.filters[filterName]
      .sort((a, b) => a.value < b.value ? -1 : a.value > b.value ? 1 : 0)
      .map((item) => {
        const label = `${item.value}`;
        return this.createIndividualBadge({filterName, item, label, onHoverMessage});
      });
  }
  buildMatchesFilter(build, filterName, filterObjects) {
    return filterObjects.every((filter) => {
      if (!filter.active) return true; // inactive filter is the same as a match
      return get(build, filterName) === filter.value; // active ones must match
    });
  }
  getFilteredBuilds() {
    // TODO this doesnt care about categories
    return this.props.builds
      .filter((b) => b.url !== undefined)
      .filter((b) => Object.entries(this.state.filters)
                      .filter((filterEntry) => filterEntry[1].length)
                      .every(([filterName, filterValues]) => this.buildMatchesFilter(b, filterName, filterValues)));
  }
  render() {
    // options only need to be calculated a single time per render, and by adding a debounce
    // to `loadOptions` we don't slow things down by comparing queries to a large number of options
    const options = this.makeOptions();
    const loadOptions = debounce((input, callback) => callback(null, {options}), DEBOUNCE_TIME);
    const styles = this.getStyles();
    const filtersByCategory = [];
    Reflect.ownKeys(this.state.filters)
      .filter((filterName) => this.state.filters[filterName].length > 0)
      .forEach((filterName) => {
        filtersByCategory.push({name: filterName, badges: this.createFilterBadges(filterName)});
      });
    const filteredBuilds = this.getFilteredBuilds();
    /* When filter categories were dynamically created (via metadata drag&drop) the `options` here updated but `<Async>`
    seemed to use a cached version of all values & wouldn't update. Changing the key forces a rerender, but it's not ideal */
    const divKey = String(Object.keys(this.state.filters).length);
    return (
      <>
        <div style={styles.base} key={divKey}>
          <splashStyles.H3 left>
            {`Filter builds `}
            <>
              <span style={{cursor: "help"}} data-tip data-for={"build-filter-info"}>
                <FaInfoCircle/>
              </span>
              <StyledTooltip type="dark" effect="solid" id={"build-filter-info"}>
                <>
                  {`Use this box to filter the displayed list of datasets based upon filtering criteria.`}
                  <br/>
                  {/* TODO do we want to keep this set logic? It's currently broken */}
                  Data is filtered by forming a union of selected values within each category, and then
                  taking the intersection between categories (if more than one category is selected).
                </>
              </StyledTooltip>
            </>
          </splashStyles.H3>
          <Select
            async
            name="filterQueryBox"
            placeholder="Type filter query here..."
            value={undefined}
            arrowRenderer={null}
            loadOptions={loadOptions}
            ignoreAccents={false}
            clearable={false}
            searchable
            multi={false}
            valueKey="label"
            onChange={this.selectionMade}
          />
          {filtersByCategory.length ? (
            <>
              {"Filtered to "}
              {filtersByCategory.map((filterCategory, idx) => {
                const multipleFilterBadges = filterCategory.badges.length > 1;
                const previousCategoriesRendered = idx!==0;
                return (
                  <span style={{fontSize: "2rem", padding: "0px 2px"}} key={filterCategory.name}>
                    {previousCategoriesRendered && <Intersect id={'intersect'+idx}/>}
                    {multipleFilterBadges && openBracketBig} {/* multiple badges => surround with set notation */}
                    {filterCategory.badges.map((badge, badgeIdx) => {
                      if (Array.isArray(badge)) { // if `badge` is an array then we wish to render a set-within-a-set
                        return (
                          <span key={badge.map((b) => b.props.id).join("")}>
                            {openBracketSmall}
                            {badge.map((el, elIdx) => (
                              <span key={el.props.id}>
                                {el}
                                {elIdx!==badge.length-1 && <Union/>}
                              </span>
                            ))}
                            {closeBracketSmall}
                            {badgeIdx!==filterCategory.badges.length-1 && ", "}
                          </span>
                        );
                      }
                      return (
                        <span key={badge.props.id}>
                          {badge}
                          {badgeIdx!==filterCategory.badges.length-1 && ", "}
                        </span>
                      );
                    })}
                    {multipleFilterBadges && closeBracketBig}
                  </span>
                );
              })}
              {". "}
            </>
          ) : null}
        </div>
        {filteredBuilds.map(buildLink)}
      </>
    );
  }
}

export default FilterBuilds;
