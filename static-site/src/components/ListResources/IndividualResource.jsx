/* eslint-disable react/prop-types */
import React, {useState, useRef, useEffect, useContext} from 'react';
import styled from 'styled-components';
import { MdHistory } from "react-icons/md";
import { SetModalContext } from './Modal';

export const LINK_COLOR = '#5097BA'
export const LINK_HOVER_COLOR = '#31586c'


/**
 * These variables allow calculation of the width of <IndividualResource>,
 * which we use for the column layout so that every <IndividualResource>
 * is nicely aligned. There are other ways (e.g. querying the DOM) but
 * this is simpler and seems to be working well.
 */
const [resourceFontSize, namePxPerChar, summaryPxPerChar] = [16, 10, 9];
const iconWidth = 20; // not including text
const gapSize = 10;
export const getMaxResourceWidth = (displayResources) => {
  return displayResources.reduce((w, r) => {
    /* add the pixels for the display name */
    let _w = r.displayName.default.length * namePxPerChar;
    if (r.nVersions) {
      _w += gapSize + iconWidth;
      _w += ((r?.updateCadence?.summary?.length || 0) + 5 + String(r.nVersions).length)*summaryPxPerChar;
    }
    return _w>w ? _w : w;
  }, 200); // 200 (pixels) is the minimum
}

export const ResourceLink = styled.a`
  font-size: ${resourceFontSize}px;
  font-family: monospace;
  white-space: pre; /* don't collapse back-to-back spaces */
  color: ${(props) => props.hovered ? LINK_HOVER_COLOR : LINK_COLOR} !important;
  text-decoration: none !important;
`;

function Name({displayName, hovered, href, topOfColumn}) {
  return (
    <ResourceLink href={href} target="_blank" rel="noreferrer" hovered={hovered}>
      {'• '}{(hovered||topOfColumn) ? displayName.hovered : displayName.default}
    </ResourceLink>
  )
}

const Container = styled.div`
  padding: 3px;
  overflow: hidden;
  color: #4F4B50;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: ${gapSize}px;
  align-items: center;
`;

export function TooltipWrapper({description, children}) {
  return (
    <div
      data-tooltip-id="listResourcesTooltip"
      data-tooltip-html={description}
      data-tooltip-place="top">
      {children}
    </div>
  )
} 

export function IconContainer({Icon, text, handleClick=undefined, color=undefined, hoverColor=undefined}) {
  const [hovered, setHovered] = useState(false);
  const defaultColor = '#aaa';
  const defaultHoverColor = "rgb(79, 75, 80)";
  const col = hovered ? (hoverColor || defaultHoverColor) : (color || defaultColor);
  const iconProps = {size: "1.2em", color: col};
  const hasOnClick = typeof handleClick === 'function';
  const cursor = hasOnClick ? 'pointer' : 'auto';
  const style = {display: 'flex', color: col, alignItems: 'center', gap: '3px', cursor};

  return (
    <div style={style} onClick={hasOnClick ? handleClick : undefined} onMouseOver={() => {setHovered(true)}} onMouseOut={() => setHovered(false)}>
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
export const IndividualResource = ({data, isMobile}) => {
  const setModal = useContext(SetModalContext);
  const ref = useRef(null);
  const [topOfColumn, setTopOfColumn] = useState(false);
  useEffect(() => {
    /* The column CSS is great but doesn't allow us to know if an element is at
    the top of its column, so we resort to JS */
    if (ref.current.offsetTop===ref.current.parentNode.offsetTop) {
      setTopOfColumn(true);
    }
  }, []);

  return (
    <Container innerRef={ref}>

      <FlexRow>

        <TooltipWrapper description={`Last known update on ${data.lastUpdated}`}>
          <ResourceLinkWrapper onShiftClick={() => setModal(data)}>
            <Name displayName={data.displayName} href={data.url} topOfColumn={topOfColumn}/>
          </ResourceLinkWrapper>
        </TooltipWrapper>

        {data.versioned && !isMobile && (
          <TooltipWrapper description={data.updateCadence.description +
            `<br/>Last known update on ${data.lastUpdated}` +
            `<br/>${data.nVersions} snapshots of this dataset available (click to see them)`}>
            <IconContainer
              Icon={MdHistory}
              text={`${data.updateCadence.summary} (n=${data.nVersions})`}
              handleClick={() => setModal(data)}
            />
          </TooltipWrapper>
        )}

      </FlexRow>

    </Container>
  )
}


/**
 * Wrapper component which monitors for mouse-over events and injects a
 * `hovered: boolean` prop into the child.
 */
export const ResourceLinkWrapper = ({children, onShiftClick}) => {
  const [hovered, setHovered] = useState(false);
  const onClick = (e) => {
    if (e.shiftKey) {
      onShiftClick();
      e.preventDefault(); // child elements (e.g. <a>) shouldn't receive the click
    }
  };
  return (
    <div>
      <div onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)} onClick={onClick}>
        {React.cloneElement(children, { hovered })}
      </div>
    </div>
  )  
}
