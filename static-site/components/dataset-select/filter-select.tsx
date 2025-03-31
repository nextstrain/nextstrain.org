/**
 * Code and components related to Filtering.
 * Most code and logic was originally lifted from Auspice
 */
import React from "react";

import { debounce } from "lodash";
import { FaInfoCircle } from "react-icons/fa";
import { createFilter, SingleValue } from "react-select";
import AsyncSelect from "react-select/async";

import CenteredContainer from "../../components/centered-container";

import StyledTooltip from "./styled-tooltip";
import { FilteringOptionsType, FilterSelectProps } from "./types";
import VirtualizedMenuList from "./virtualized-menu-list";

const DEBOUNCE_TIME = 200;

/**
 * A React Server Component, intended to be used as a `interfaces`
 * property in a <DatasetSelect> component.
 *
 * Provides a way to display a selection box for activating new filters.
 */
export default function FilterSelect({
  options,
  applyFilter,
  title,
}: FilterSelectProps) {
  return (
    <CenteredContainer>
      <h3>
        {title}
        <>
          <span
            style={{ cursor: "help" }}
            data-tip
            data-for={"build-filter-info"}
          >
            <FaInfoCircle />
          </span>
          <StyledTooltip id={"build-filter-info"}>
            <>
              Use this box to filter the displayed data based upon keywords.
              <br />
              {/* TODO do we want to keep this set logic? It's currently broken */}
              Data is filtered by forming a union of selected values within each
              category, and then taking the intersection between categories (if
              more than one category is selected).
            </>
          </StyledTooltip>
        </>
      </h3>
      <span style={{ fontSize: "14px" }}>
        <AsyncSelect
          name="filterQueryBox"
          placeholder="Type filter query here..."
          value={null}
          defaultOptions
          loadOptions={debounce(
            (_input, callback) => callback(options),
            DEBOUNCE_TIME,
          )}
          filterOption={createFilter({ ignoreAccents: false })}
          isClearable={false}
          isSearchable
          isMulti={false}
          getOptionValue={(option: FilteringOptionsType) => option.label}
          onChange={(sel: SingleValue<FilteringOptionsType>) =>
            applyFilter("add", sel?.value[0] || "", [sel?.value[1] || ""])
          }
          components={{
            DropdownIndicator: null,
            MenuList: VirtualizedMenuList,
          }}
        />
      </span>
    </CenteredContainer>
  );
}
