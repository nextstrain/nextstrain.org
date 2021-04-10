/**
 * Code and components related to Filtering.
 * Most code and logic was originally lifted from Auspice
 */
import { sum } from "lodash";
import React from "react";
import { Tooltip, FilterBadge} from "./filterBadge";
import { CenteredContainer } from "./styles";


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


export const FilterDisplay = ({filters, applyFilter}) => {
  const filtersByCategory = groupFiltersByCategory(filters, applyFilter);

  if (!filtersByCategory.length) return null;
  if (!sum(filtersByCategory.map((c) => c.badges.length))) return null;

  return (
    <CenteredContainer>
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
    </CenteredContainer>
  );
};

function groupFiltersByCategory(filters, applyFilter) {
  const filtersByCategory = [];
  Reflect.ownKeys(filters)
    .filter((filterName) => [filterName].length > 0)
    .forEach((filterName) => {
      filtersByCategory.push({
        name: filterName,
        badges: createFilterBadges(filters, filterName, applyFilter)
      });
    });
  return filtersByCategory;
}

function createFilterBadges(filters, filterName, applyFilter) {
  const nFilterValues = filters[filterName].length;
  const onHoverMessage = nFilterValues === 1 ?
    `Filtering datasets to this ${filterName}` :
    `Filtering datasets to these ${nFilterValues} ${filterName}`;
  return filters[filterName]
    .sort((a, b) => a.value < b.value ? -1 : a.value > b.value ? 1 : 0)
    .map((item) => {
      const label = `${item.value}`;
      return createIndividualBadge({filterName, item, label, onHoverMessage, applyFilter});
    });
}


function createIndividualBadge({filterName, item, label, onHoverMessage, applyFilter}) {
  return (
    <FilterBadge
      key={item.value}
      id={String(item.value)}
      remove={() => {applyFilter("remove", filterName, [item.value]);}}
      canMakeInactive
      onHoverMessage={onHoverMessage}
      active={item.active}
      activate={() => {applyFilter("add", filterName, [item.value]);}}
      inactivate={() => {applyFilter("inactivate", filterName, [item.value]);}}
    >
      {label}
    </FilterBadge>
  );
}
