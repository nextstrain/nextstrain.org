/* eslint-disable react/prop-types */
import React, {useState, useCallback} from 'react';
import styled from 'styled-components';
import { MdCached } from "react-icons/md";
import {Hover} from "./Hover.jsx";
import { Lollipop } from "./Lollipop.jsx";


/* Following is very ad-hoc */
const nameFontSize = 16; // px
const pixelsPerCharacter = 10.85; // presumably depends on the font the browser chooses?
const versionSize = 55; // ???
const lollipopWidth = 80;
const gapSize = 10;
export const _maxTileWidth = (names) => {
  let max = 200; // pixels
  for (const name of names) {
    const px = name.length*pixelsPerCharacter;
    if (px > max) max=px;
  }
  return max + lollipopWidth + versionSize + gapSize*2;
}


/**
 * <Name> is the element for a collection's title. It may or may not be a link.
 */
function Name({name, displayName, hovered}) {
  const href = `/${name}`;
  return (
      <a href={href} target="_blank" rel="noreferrer"
        style={{ fontSize: `${nameFontSize}px`, fontFamily: 'monospace', whiteSpace: 'pre',
          color: hovered ? '#31586c' : '#5097BA'}}
      >
        {/* {prettyName} */}
        {hovered ? displayName.hovered : displayName.default}
      </a>
  )
}





const ResourceTileContainer = styled.div`
  padding: 3px;
  /* background-color: aquamarine; */
  /* background-color: white; */
  overflow: hidden;
  color: #4F4B50;
`

const ResourceTileUpperSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: ${gapSize}px;
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
export const ResourceTile = ({data, setModal, lollipopXScale}) => {

  return (
    <ResourceTileContainer>

      <ResourceTileUpperSection>

        <Lollipop x={lollipopXScale} date={data.lastUpdated} dates={data.dates}/>

        <ResourceLink data={data} setModal={setModal}>
          <Name name={data.name} displayName={data.displayName}/>
        </ResourceLink>

        <IconContainer
          description={`${data.nVersions} snapshots of this dataset available (click to see them)`}
          Icon={MdCached}
          text={data.nVersions}
          handleClick={() => setModal(data)}
        />

      </ResourceTileUpperSection>

    </ResourceTileContainer>
  )
}


export const ResourceLink = ({children, data, setModal}) => {

  /**
   * I wanted to use a library to manage on-hover tooltips but couldn't find a satisfactory one.
   * Requirements: component as tooltip + only render the component when hovered
   */

  const [hovered, setHovered] = useState(false);
  // console.log("ResourceTile", data)

  const onShiftClick = useCallback((e) => {
    if (e.shiftKey) {
      setModal(data);
      e.preventDefault(); // we don't want the child <a> element to receive the click
    }
  }, [data, setModal])

  const onMouseOver = useCallback((event) => {
    setHovered([event.clientX, event.clientY])
  },[])

  const onMouseOut = useCallback(() => setHovered(false), [setHovered]);
  return (
    <div>
      <div onMouseOver={onMouseOver} onMouseOut={onMouseOut} onClick={onShiftClick}>
        {React.cloneElement(children, { hovered: !!hovered })}
      </div>
      { hovered && (
        <Hover x={hovered[0]} y={hovered[1]} data={data}/>
      )}
    </div>
  )

  
}

