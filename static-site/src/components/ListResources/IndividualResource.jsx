/* eslint-disable react/prop-types */
import React, {useState, useCallback, useRef, useEffect, useContext} from 'react';
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
const [resourceFontSize, pxPerChar] = [16, 10];
const iconWidth = 50; // including text
const gapSize = 10;
export const getMaxResourceWidth = (names) => {
  const nameWidth = names.reduce((w, n) => {
    const _w = n.length*pxPerChar;
    return _w>w ? _w : w;
  }, 200); // 200 is the minimum
  return nameWidth + gapSize + iconWidth;
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
  const setThisModal = useCallback(() => setModal(data), [setModal, data]);
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

        <ResourceLinkWrapper onShiftClick={setThisModal}>
          <Name displayName={data.displayName} href={data.url} topOfColumn={topOfColumn}/>
        </ResourceLinkWrapper>

        {data.versioned && !isMobile && (
          <TooltipWrapper description={`${data.nVersions} snapshots of this dataset available (click to see them)`}>
            <IconContainer
              Icon={MdHistory}
              text={data.nVersions}
              handleClick={setThisModal}
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
  const onMouseOver = useCallback(() => {
    setHovered(true)
  },[])
  const onMouseOut = useCallback(() => setHovered(false), [setHovered]);
  const onClick = useCallback((e) => {
    if (e.shiftKey) {
      onShiftClick();
      e.preventDefault(); // child elements (e.g. <a>) shouldn't receive the click
    }
  }, [onShiftClick])
  return (
    <div>
      <div onMouseOver={onMouseOver} onMouseOut={onMouseOut}  onClick={onClick}>
        {React.cloneElement(children, { hovered })}
      </div>
    </div>
  )  
}
