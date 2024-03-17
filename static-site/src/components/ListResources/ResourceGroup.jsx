/* eslint-disable react/prop-types */
import React, {useState} from 'react';
import styled from 'styled-components';
import { MdHistory, MdFormatListBulleted, MdChevronRight } from "react-icons/md";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import { IndividualResource, getMaxResourceWidth, TooltipWrapper, IconContainer } from "./IndividualResource.jsx"

const ResourceGroupHeader = ({data, isMobile, setCollapsed, collapsible, isCollapsed, resourcesToShowWhenCollapsed}) => {

  return (
    <HeaderContainer>

      <NextstrainLogo/>

      <FlexColumnContainer>
        
        <HeaderRow>
          <span style={{ fontSize: '2rem', fontWeight: '700'}}>
            {data.groupName}
          </span>
          {/* Currently we hide the byline on mobile, but we could render it as a separate row */}
          {!isMobile && (
            <TooltipWrapper description={`The most recently updated datasets in this group were last updated on ${data.lastUpdated}` +
                '<br/>(however there may have been a more recent update since we indexed the data)'}>
              <span>
                {`Most recent snapshot: ${data.lastUpdated}`}
              </span>
            </TooltipWrapper>
          )}
          <span style={{flexGrow: 100}}/>
          <TooltipWrapper description={`There are ${data.nResources} datasets in this group`}>
            <IconContainer
              Icon={MdFormatListBulleted} color={"rgb(79, 75, 80)"}
              text={data.nResources}
            />
          </TooltipWrapper>
          {data.nVersions && !isMobile && (
            <TooltipWrapper description={`${data.nVersions} snapshots exist across the ${data.nResources} datasets in this group`}>
              <IconContainer
                Icon={MdHistory}  color={"rgb(79, 75, 80)"}
                text={data.nVersions}
              />
            </TooltipWrapper>
          )}
        </HeaderRow>

        {collapsible && (
          <div style={{display: 'flex', width: '100%'}}>
          <CollapseContainer onClick={() => setCollapsed(!isCollapsed)}>
            <Rotate rotate={isCollapsed ? '0' : '90'}>
              <MdChevronRight size="30px"/>
            </Rotate>
            {isCollapsed ? (
              <TooltipWrapper description={`For brevity we're only showing a subset of ${data.groupName} resources - click to show them all`}>
                {` show ${data.resources.length - resourcesToShowWhenCollapsed} more datasets`}
              </TooltipWrapper>
            ) : (
              ' collapse datasets'
            )}
          </CollapseContainer>
          </div>
        )}

      </FlexColumnContainer>

    </HeaderContainer>
  )
}

/**
 * Displays a single resource group (e.g. a single pathogen)
 */
export const ResourceGroup = ({data, elWidth, numGroups, sortMethod}) => {
  const {collapseThreshold, resourcesToShowWhenCollapsed} = collapseThresolds(numGroups);
  const collapsible = data.resources.length > collapseThreshold;
  const [isCollapsed, setCollapsed] = useState(collapsible); // if it is collapsible, start collapsed
  const displayResources = isCollapsed ? data.resources.slice(0, resourcesToShowWhenCollapsed) : data.resources;
  _setDisplayName(displayResources)
  /* isMobile: boolean determines whether we expose snapshots, as we hide them on small screens */
  const isMobile = elWidth < 500;

  const maxResourceWidth = getMaxResourceWidth(displayResources.map((r) => r.displayName.default));

  return (
    <ResourceGroupContainer>
      <ResourceGroupHeader data={data}
        setCollapsed={setCollapsed} collapsible={collapsible}
        isCollapsed={isCollapsed} resourcesToShowWhenCollapsed={resourcesToShowWhenCollapsed}
        isMobile={isMobile}
      />

      <IndividualResourceContainer maxResourceWidth={maxResourceWidth}>
        {/* what to do when there's only one tile in a group? */}
        {displayResources.map((d) => (
          // We use key changes to re-render the component & thus recompute the DOM position
          <IndividualResource data={d} key={`${d.name}_${isCollapsed}_${elWidth}_${sortMethod}`} isMobile={isMobile}/>
        ))}
      </IndividualResourceContainer>
    </ResourceGroupContainer>
  )
}


const ResourceGroupContainer = styled.div`
  background-color: rgb(251, 251, 251);
  margin-bottom: 10px; /* spacing between groups */
  padding-bottom: 5px; /* leave some space inside the group at the bottom */
  border: 2px solid rgb(204, 204, 204);
  border-radius: 5px;
`;

const IndividualResourceContainer = styled.div`
  /* Columns are a simple CSS solution which works really well _if_ we can calculate the expected maximum 
  resource width */
  column-width: ${(props) => props.maxResourceWidth}px;
  column-gap: 20px;
`

/**
 * Only contains the header, not the individual resources. We use a (very)
 * subtle background colour here to differentiate the group details from the
 * individual resources.
 */
const HeaderContainer = styled.div`
  padding: 5px;
  margin-bottom: 5px;
  background-color: rgb(248, 248, 248);
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
`

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end; /* all elements share common baseline */
  gap: 10px;
  padding-left: 10px; /* vertically aligns the row with the collapse icon (if any) */
  color: #4F4B50;
  width: 100%;
`

const FlexColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex-grow: 10;
`

const CollapseContainer = styled.div`
  /* flexbox used to vertically align the icon & text */
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  font-size: 1.6rem;
`;

const Rotate = styled.div`
  max-width: 30px;
  max-height: 30px;
  /* font-size: 25px; */
  display: inline-block;
  transition: all .3s ease-in;
  transform: rotate(${(props) => props.rotate}deg);
`;


function NextstrainLogo() {
  /**
   * TODO -- map the resource collection name to a suitable logo.
   * Currently we are only using core datasets
   */
  return <img alt="nextstrain logo" height="35px" src={nextstrainLogo}/>
}

/**
 * Adds the `displayName` property to each resource.
 * Given successive nameParts:
 *      [ flu, seasonal, h1n1pdm]   
 *      [ flu, seasonal, h3n2]
 * We want to produce two names: a default name, which contains all parts,
 * and a displayName which hides the fields that match the preceding name.
 * This allows for a UI to display them in a tree-like manner such as:
 *      "flu | seasonal | h1n1pdm"
 *      "    |          | h3n2"
 */
function _setDisplayName(resources) {
  const sep = "│"; // ASCII 179
  resources.forEach((r, i) => {
    let name;
    if (i===0) {
      name = r.nameParts.join(sep);
    } else {
      let matchIdx = r.nameParts.map((word, j) => word === resources[i-1].nameParts[j]).findIndex((v) => !v);
      if (matchIdx===-1) { // -1 means every word is in the preceding name, but we should display the last word anyway 
        matchIdx = r.nameParts.length-2;
      }
      name = r.nameParts.map((word, j) => j < matchIdx ? ' '.repeat(word.length) : word).join(sep);
    }
    r.displayName = {hovered: r.nameParts.join(sep), default: name}
  })
}

function collapseThresolds(numGroups) {
  /* The collapse thresholds are determined by the total number of groups displayed */
  let collapseThreshold = 12; /* if there are more than this many resources then we can collapse */
  let resourcesToShowWhenCollapsed = 8; /* iff collapsed, show this many resources */
  if (numGroups===1) {
    /* essentially show them all */
    collapseThreshold = 100;
    resourcesToShowWhenCollapsed = 100;
  } else if (numGroups===2) {
    collapseThreshold = 50;
    resourcesToShowWhenCollapsed = 40;
  }
  return {collapseThreshold, resourcesToShowWhenCollapsed}
}