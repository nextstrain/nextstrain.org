/* eslint-disable react/prop-types */
import React, {useState} from 'react';
import styled from 'styled-components';
import { MdCached } from "react-icons/md";
import {Hover} from "./Hover.jsx";
import { Lollipop } from "./Lollipop.jsx";


/**
 * <Name> is the element for a collection's title. It may or may not be a link.
 */
function Name({name, hovered, wordLengths, previousName}) {
  const href = `/${name}`;
  const words = name.split("/");
  const prevWords = (previousName||"").split("/");
  const j = hovered ? 0 : prevWords.map((word, i) => word === words[i]).findIndex((el) => !el);
  const prettyName = words
    .map((word, i) => i>=j ? word + ' '.repeat(wordLengths[i]-word.length) : ' '.repeat(wordLengths[i]))
    .join("│") // ASCII 179
  return (
      <a href={href} target="_blank" rel="noreferrer"
        style={{ fontSize: '1.8rem', fontFamily: 'monospace', whiteSpace: 'pre',
          color: hovered ? '#31586c' : '#5097BA'}}
      >
        {prettyName}
      </a>
  )
}




const ResourceTileContainer = styled.div`
  /* margin: 5px; */
  padding: 3px;
  /* background-color: aquamarine; */
  background-color: white;
  /* border: 2px solid black; */
  min-width: max(250px, 20%);
  max-width: max(250px, 40%);

  /* display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
  align-items: flex-start; */
  color: #4F4B50;
`

const ResourceTileUpperSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  color: #4F4B50;
`

// TODO XXX - duplicated from ResourceGroup.jsx
function IconContainer({description, Icon, text, handleClick=undefined}) {
  const color = "#aaa";
  const iconProps = {size: "1.2em", color};
  const hasOnClick = typeof handleClick === 'function';
  return (
    <div
      style={{display: 'flex', color, alignItems: 'center', gap: '3px', cursor: hasOnClick?'pointer':'auto'}}
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


/**
 * 
 * @param {*} param0 
 * @returns 
 */
export const ResourceTile = ({data, setModal, wordLengths, previousName, lollipopXScale}) => {

  /**
   * I wanted to use a library to manage on-hover tooltips but couldn't find a satisfactory one.
   * Requirements: component as tooltip + only render the component when hovered
   */
  const [hovered, setHovered] = useState(false);
  // console.log("ResourceTile", data)

  const onShiftClick = (e) => {
    if (e.shiftKey) {
      setModal(data);
      e.preventDefault(); // we don't want the child <a> element to receive the click
    }
  }

  return (
    <ResourceTileContainer>

      <ResourceTileUpperSection>

        <Lollipop x={lollipopXScale} date={data.lastUpdated}/>

        <div onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)} onClick={onShiftClick}>
          <Name name={data.name} hovered={hovered} wordLengths={wordLengths} previousName={previousName}/>
        </div>

        <IconContainer
          description={`${data.nVersions} snapshots of this dataset available (click to see them)`}
          Icon={MdCached}
          text={data.nVersions}
          handleClick={() => setModal(data)}
        />

        { hovered && (
          <Hover dates={data.dates}/>
        )}

      </ResourceTileUpperSection>

      {/* <span style={{flexGrow: 100}}/> */}
      {/* <BeadPlot versions={data.dates} xPx={200}/> */}
      {/* <SparkLine versions={data.dates}/> */}

    </ResourceTileContainer>
  )
}
