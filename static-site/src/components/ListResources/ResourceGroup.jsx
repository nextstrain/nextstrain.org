/* eslint-disable react/prop-types */
import React, {useState} from 'react';
import styled from 'styled-components';
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import { MdCached, MdOutlineShare } from "react-icons/md";
import { ResourceTile, ResourceLink } from "./ResourceTile.jsx"
import { lollipopScale } from "./Lollipop";
import { quickLinkData } from "./Showcase";


const nextstrainSidebarBorderColor = `rgb(204, 204, 204)`;

const ResourceGroupContainer = styled.div`
  font-size: 18px;
  background-color: rgb(251, 251, 251);
  /* border: 1px solid red; */
  margin-bottom: 10px;
  border: 2px solid ${nextstrainSidebarBorderColor};
  border-radius: 5px;
`;



const ResourceTilesContainer = styled.div`
  /* Most of the time this works nicely, but there are a few situations where it
  doesn't. When the page width is such that a single column overflows (not
  really a problem with this CSS) and for some page widths the content overflows
  the <ResourceTileContainer>
  */
  column-count: auto;
  column-width: 400px;
  column-gap: 1em; /* 1em is default */

  /* The following doesn't have any transitions, and (AFAIK) transitions aren't possible
  on 'display'. I tried to use <https://www.npmjs.com/package/react-collapsed> but it isn't
  compatible with this version of Gatsby. */
  /* display: ${(props) => props.isCollapsed ? 'none' : 'block'}; */
`

/**
 * Only contains the header, not the tiles
 */
const ResourceGroupHeaderContainer = styled.div`
  /* border-top: 2px solid #ece2f0; */
  padding: 5px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  color: #4F4B50;
`

const ResourceHeaderRow = styled.div`
  /* padding: 5px; */
  /* margin-bottom: 5px; */
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  color: #4F4B50;
  width: 100%;
`

const QuickLinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  font-size: 16px;
  position: relative;
`

const QuickLinkContainer = styled.div`
  padding-left: 10px;
`

const QuickLinkLink = styled.a`
  font-family: monospace;
  color: ${(props) => props.hovered ? '#31586c' : '#5097BA'} !important;
  cursor: pointer;
  text-decoration: none !important;
`

const FlexColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  flex-grow: 10;
`

const CollapseContainer = styled.div`
  padding: 5px 0px 5px 20px;
  cursor: pointer;
`


const ResourceGroupHeader = ({data, sortMethod, setModal}) => {

  const title = sortMethod === 'alphabetical' ? data.groupName : `Datasets last updated ${data.groupName}`

  let lastUpdatedText = '';
  if (sortMethod==='alphabetical') {
    const lastUpdatedDates = data.resources.map((r) => r.lastUpdated)
    lastUpdatedText = `Last updated between ${lastUpdatedDates.at(-1)} & ${lastUpdatedDates.at(0)}`;
  }

  const resourcesByName = Object.fromEntries(data.resources.map((r) => [r.name, r]));
  const quickLinks = quickLinkData.filter((ql) => !!resourcesByName[ql.name])
  console.log("quickLinks", quickLinks)
  return (
    <ResourceGroupHeaderContainer>

      <NextstrainLogo/>

      <FlexColumnContainer>
        
        <ResourceHeaderRow>
          <span style={{ fontSize: '2rem', fontWeight: '700'}}>
            {title}
          </span>
          {/* todo graph / viz / whatever */}
          <span>
            {lastUpdatedText}
          </span>
          <span style={{flexGrow: 100}}/>
          <IconContainer
            description="Total number of distinct resources in this group"
            Icon={MdOutlineShare}
            text={data.nResources}
          />
          <IconContainer
            description="Total number of available versions for the resources listed in this group"
            Icon={MdCached}
            text={data.nVersions}
          />
        </ResourceHeaderRow>

  
        {!!quickLinks.length && (
          <QuickLinksContainer>
            Quick links:
            {quickLinks.map((ql) => (
              <QuickLinkContainer key={ql.name}>
                <ResourceLink data={resourcesByName[ql.name]} setModal={setModal}>
                  <QuickLinkLink href={`/${ql.name}`} target="_blank" rel="noreferrer">
                    {ql.display}
                  </QuickLinkLink>
                </ResourceLink>
              </QuickLinkContainer>
            ))}
          </QuickLinksContainer>
        )}


      </FlexColumnContainer>


    </ResourceGroupHeaderContainer>
  )
}




export const ResourceGroup = ({data, sortMethod, setModal}) => {

  const collapsibleThreshold = 10;
  const collapsible = data.resources.length > collapsibleThreshold;
  const [isCollapsed, setCollapsed] = useState(collapsible); // if it is collapsible, start collapsed
  const displayResources = isCollapsed ? data.resources.slice(0, collapsibleThreshold) : data.resources;

  const wordLengths = _wordLengths(data.resources.map((d) => d.name))
  const lollipopXScale = lollipopScale(data.firstUpdated, data.lastUpdated);
  return (
    <ResourceGroupContainer>
      <ResourceGroupHeader data={data} sortMethod={sortMethod} setModal={setModal}
        isCollapsed={isCollapsed} setCollapsed={setCollapsed}
      />
      <ResourceTilesContainer>
        {/* what to do when there's only one tile in a group? */}
        {displayResources.map((d, i) => (
          <ResourceTile data={d} setModal={setModal} key={d.name}
                        wordLengths={wordLengths} previousName={i===0 ? null : data.resources[i-1].name}
                        lollipopXScale={lollipopXScale}/>
        ))}
      </ResourceTilesContainer>

      {collapsible && (
        <CollapseContainer onClick={() => setCollapsed(!isCollapsed)}>
          {isCollapsed ?
            String.fromCharCode(9660)+` show ${data.resources.length - collapsibleThreshold} more datasets` : 
            String.fromCharCode(9650)+' collapse datasets'}
        </CollapseContainer>
      )}

    </ResourceGroupContainer>
  )
}



function NextstrainLogo(name) {
  /**
   * TODO -- map the resource collection name to a suitable logo.
   * Currently we are only using core datasets
   */
  return <img alt="nextstrain logo" height="35px" src={nextstrainLogo}/>
}



function IconContainer({description, Icon, text, handleClick=undefined, selected=false}) {
  const iconProps = {size: "1.2em"};
  if (selected) iconProps.color = '#4F4B50';
  const hasOnClick = typeof handleClick === 'function';
  return (
    <div
      style={{display: 'flex', alignItems: 'center', gap: '3px', cursor: hasOnClick?'pointer':'auto'}}
      data-tooltip-id="iconTooltip"
      data-tooltip-content={description}
      data-tooltip-place="top"
      onClick={hasOnClick ? handleClick : ()=>{}}
    >
      <Icon {...iconProps}/>
      {text}
    </div>
  )
}


function _wordLengths(names) {
  const wordLengths = []
  for (const name of names) {
    for (const [i, word] of name.split('/').entries()) { // TODO -- do this in a more central place
      if (i>=wordLengths.length) wordLengths.push(0);
      if (wordLengths[i]<word.length) wordLengths[i]=word.length;
    }
  }
  return wordLengths;
}
