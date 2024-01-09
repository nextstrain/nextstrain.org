/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import { MdCached, MdOutlineShare } from "react-icons/md";
import { BeadPlot } from "./BeadPlot.jsx";

const nextstrainSidebarBackgroundColor = `rgb(242, 242, 242)`;
const nextstrainSidebarBorderColor = `rgb(204, 204, 204)`;

const ResourceGroupContainer = styled.div`
  font-size: 18px;
  background-color: ${nextstrainSidebarBackgroundColor};
  /* border: 1px solid red; */
  margin-bottom: 10px;
  border: 2px solid ${nextstrainSidebarBorderColor};
  border-radius: 5px;
`;

/**
 * TODO - flexbox or grid? Probably want grid-like aesthetics.
 */
const ResourceTilesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  column-gap: 5px;
  row-gap: 5px;
  width: 100%;
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

const ResourceGroupHeader = ({data}) => {

  return (
    <ResourceGroupHeaderContainer>

      <NextstrainLogo/>
      <span style={{ fontSize: '2rem', fontWeight: '700'}}>
        {data.groupName}
      </span>
      {/* todo graph / viz / whatever */}
      <span>{`${data.nResources} resources updated ${data.lastUpdated}`}</span>
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

    </ResourceGroupHeaderContainer>
  )
}

const ResourceTileContainer = styled.div`
  /* margin: 5px; */
  padding: 5px;
  /* background-color: aquamarine; */
  background-color: white;
  border: 2px solid black;
  min-width: max(250px, 24%);
  max-width: max(250px, 49%);


  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
  align-items: flex-start;
  color: #4F4B50;
`

const ResourceTileUpperSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  color: #4F4B50;
`


const ResourceTile = ({data}) => {

  return (
    <ResourceTileContainer>

      <ResourceTileUpperSection>
        <IconContainer
          description="Total number of available versions"
          Icon={MdCached}
          text={data.nVersions}
        />
        <Name name={data.name}/>
      </ResourceTileUpperSection>

      {/* <span style={{flexGrow: 100}}/> */}
      <BeadPlot versions={data.dates} xPx={200}/>

    </ResourceTileContainer>
  )
}


/**
 * TKTK
 * @param {Object} props React props
 * @param {[groupInfo, groupMembers]} props.data
 * @returns 
 */
export const ResourceGroup = ({data}) => {
  const [groupInfo, groupMembers] = data;
  return (
    <ResourceGroupContainer>
      <ResourceGroupHeader data={groupInfo}/>
      <ResourceTilesContainer>
        {/* what to do when there's only one tile in a group? */}
        {groupMembers.map((d) => (
          <ResourceTile data={d} key={d.name}/>
        ))}
      </ResourceTilesContainer>
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


/**
 * <Name> is the element for a collection's title. It may or may not be a link.
 */
function Name({name}) {
  const prettyName = name.replace(/\//g, "│"); // ASCII 179
  const href = `/${name}`
  return (
    <a href={href} target="_blank" rel="noreferrer"
      data-tooltip-id="iconTooltip" data-tooltip-place="top"
      data-tooltip-content={"Click to view the (current / latest) dataset"}
      style={{ fontSize: '1.8rem', fontWeight: '300'}}
    >
      {prettyName}
    </a>
  )
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