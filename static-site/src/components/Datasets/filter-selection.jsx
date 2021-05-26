/**
 * Code and components related to Filtering.
 * Most code and logic was originally lifted from Auspice
 */
import React from "react";
import styled from 'styled-components';
import { debounce } from 'lodash';
import ReactTooltip from 'react-tooltip';
import { FaInfoCircle } from "react-icons/fa";
import Select from "react-virtualized-select";
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
        <Select
          async
          name="filterQueryBox"
          placeholder="Type filter query here..."
          value={undefined}
          arrowRenderer={null}
          loadOptions={debounce((input, callback) => callback(null, {options}), DEBOUNCE_TIME)}
          ignoreAccents={false}
          clearable={false}
          searchable
          multi={false}
          valueKey="label"
          onChange={(sel) => applyFilter("add", sel.value[0], [sel.value[1]])}
        />
      </span>
    </CenteredContainer>
  );
};

