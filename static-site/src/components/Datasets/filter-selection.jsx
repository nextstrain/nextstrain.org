/**
 * Code and components related to Filtering.
 * Most code and logic was originally lifted from Auspice
 */
import React from "react";
import styled from 'styled-components';
import { debounce, isEqual } from 'lodash';
import ReactTooltip from 'react-tooltip';
import { FaInfoCircle } from "react-icons/fa";
import { createFilter } from "react-select";
import AsyncSelect from "react-select/async";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List } from "react-virtualized/dist/es/List";
import 'react-virtualized/styles.css';
import * as splashStyles from "../splash/styles";
import { CenteredContainer } from "./styles";

const DEBOUNCE_TIME = 200;

const StyledTooltip = styled(ReactTooltip)`
  max-width: 30vh;
  white-space: normal;
  line-height: 1.2;
  padding: 10px !important; /* override internal styling */
  z-index: 1002 !important; /* on top of viz legend */
  pointer-events: auto !important;
`;

const VirtualizedMenuList = ({ children, maxHeight, focusedOption }) => {
  /**
  * If the focused option is outside of the currently displayed options, we
  * need to create the scrollToIndex so that the List can be forced to scroll
  * to display the focused option.
  */
  let scrollToIndex;
  if (children instanceof Array) {
    const focusedOptionIndex = children.findIndex((option) => (
      isEqual(focusedOption, option.props.data)
    ));
    if (focusedOptionIndex >= 0) {
      scrollToIndex = focusedOptionIndex;
    }
  }

  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>{children[index]}</div>
  );

  return (
    <AutoSizer disableHeight >
      {({ width }) => (
        <List
          height={maxHeight}
          rowHeight={40}
          rowRenderer={rowRenderer}
          rowCount={children.length || 0}
          width={width}
          scrollToIndex={scrollToIndex}
        />
      )}
    </AutoSizer>
  );
};

export const FilterSelect = ({options, applyFilter, title}) => {
  return (
    <CenteredContainer>
      <splashStyles.H3 left>
        {title}
        <>
          <span style={{cursor: "help"}} data-tip data-for={"build-filter-info"}>
            <FaInfoCircle/>
          </span>
          <StyledTooltip type="dark" effect="solid" id={"build-filter-info"}>
            <>
              Use this box to filter the displayed data based upon keywords.
              <br/>
              {/* TODO do we want to keep this set logic? It's currently broken */}
              Data is filtered by forming a union of selected values within each category, and then
              taking the intersection between categories (if more than one category is selected).
            </>
          </StyledTooltip>
        </>
      </splashStyles.H3>
      <span style={{fontSize: "14px"}}>
        <AsyncSelect
          name="filterQueryBox"
          placeholder="Type filter query here..."
          value={null}
          defaultOptions
          loadOptions={debounce((input, callback) => callback(options), DEBOUNCE_TIME)}
          filterOption={createFilter({ignoreAccents: false})}
          isClearable={false}
          isSearchable
          isMulti={false}
          getOptionValue={(option) => option.label}
          onChange={(sel) => applyFilter("add", sel.value[0], [sel.value[1]])}
          components={{ DropdownIndicator: null, MenuList: VirtualizedMenuList }}
        />
      </span>
    </CenteredContainer>
  );
};

