/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import { MdCached, MdOutlineShare } from "react-icons/md";
import { ResourceTile } from "./ResourceTile.jsx"
import { lollipopScale } from "./Lollipop";


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
  /* display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  column-gap: 5px;
  row-gap: 5px;
  width: 100%; */


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

const ResourceGroupHeader = ({data, sortMethod}) => {

  const title = sortMethod === 'alphabetical' ? data.groupName : `Datasets last updated ${data.groupName}`

  console.log(data.groupName, )

  let lastUpdatedText = '';
  if (sortMethod==='alphabetical') {
    const lastUpdatedDates = data.resources.map((r) => r.lastUpdated)
    lastUpdatedText = `Last updated between ${lastUpdatedDates.at(-1)} & ${lastUpdatedDates.at(0)}`;
  }
  return (
    <ResourceGroupHeaderContainer>

      <NextstrainLogo/>
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

    </ResourceGroupHeaderContainer>
  )
}


export const ResourceGroup = ({data, sortMethod, setModal}) => {
  // const [groupInfo, groupMembers] = data;

  // console.log("ResourceGroup", "groupInfo", groupInfo, "groupMembers", groupMembers)

  const wordLengths = _wordLengths(data.resources.map((d) => d.name))
  // const lastUpdatedDates = data.resources.map((r) => r.lastUpdated);
  // const lollipopXScale = lollipopScale(lastUpdatedDates.at(-1), lastUpdatedDates.at(0))
  const lollipopXScale = lollipopScale(data.firstUpdated, data.lastUpdated);
  return (
    <ResourceGroupContainer>
      <ResourceGroupHeader data={data} sortMethod={sortMethod}/>
      <ResourceTilesContainer>
        {/* what to do when there's only one tile in a group? */}
        {data.resources.map((d, i) => (
          <ResourceTile data={d} setModal={setModal} key={d.name}
                        wordLengths={wordLengths} previousName={i===0 ? null : data.resources[i-1].name}
                        lollipopXScale={lollipopXScale}/>
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
