/* eslint-disable react/prop-types */
import React, {useState, useRef, useEffect, useContext} from 'react';
import styled from 'styled-components';
import { MdHistory } from "react-icons/md";
import { SetModalResourceContext } from './Modal';
import { ResourceDisplayName, Resource, DisplayNamedResource } from './types';
import { IconType } from 'react-icons';
import { InternalError } from '../ErrorBoundary';

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
export const getMaxResourceWidth = (displayResources: DisplayNamedResource[]) => {
  return displayResources.reduce((w, r) => {
    /* add the pixels for the display name */
    let _w = r.displayName.default.length * namePxPerChar;
    if (r.nVersions && r.updateCadence) {
      _w += gapSize + iconWidth;
      _w += ((r.updateCadence.summary.length || 0) + 5 + String(r.nVersions).length)*summaryPxPerChar;
    }
    return _w>w ? _w : w;
  }, 200); // 200 (pixels) is the minimum
}

export const ResourceLink = styled.a`
  font-size: ${resourceFontSize}px;
  font-family: monospace;
  white-space: pre; /* don't collapse back-to-back spaces */
  color: ${LINK_COLOR} !important;
  text-decoration: none !important;

  &:hover {
    color: ${LINK_HOVER_COLOR} !important;
  }
`;

function Name({
  displayName,
  href,
  topOfColumn,
}: {
  displayName: ResourceDisplayName
  href: string
  topOfColumn: boolean
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <ResourceLink href={href} target="_blank" rel="noreferrer"
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}>
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

export function IconContainer({
  Icon,
  text,
  handleClick,
  color,
  hoverColor,
}: {
  Icon: IconType
  text: string
  handleClick?: () => void
  color?: string
  hoverColor?: string
}) {
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


export const IndividualResource = ({
  resource,
  isMobile,
}: {
  resource: Resource
  isMobile: boolean
}) => {
  const setModalResource = useContext(SetModalResourceContext);
  if (!setModalResource) throw new InternalError("Context not provided!")

  const ref = useRef<HTMLDivElement>(null);
  const [topOfColumn, setTopOfColumn] = useState(false);
  useEffect(() => {
    if (ref.current === null ||
        ref.current.parentNode === null ||
        ref.current.parentNode.nodeName != 'DIV') {
      throw new InternalError("ref must be defined and the parent must be a div (IndividualResourceContainer).");
     }

    /* The column CSS is great but doesn't allow us to know if an element is at
    the top of its column, so we resort to JS */
    if (ref.current.offsetTop===(ref.current.parentNode as HTMLDivElement).offsetTop) {
      setTopOfColumn(true);
    }
  }, []);

  // don't show anything if display name is unavailable
  if (!resource.displayName) return null

  // add history if mobile and resource has version info
  let history: React.JSX.Element | null = null
  if (!isMobile && resource.updateCadence && resource.nVersions && resource.lastUpdated) {
    history = (
      <TooltipWrapper description={resource.updateCadence.description +
        `<br/>Last known update on ${resource.lastUpdated}` +
        `<br/>${resource.nVersions} snapshots of this dataset available (click to see them)`}>
        <IconContainer
          Icon={MdHistory}
          text={`${resource.updateCadence.summary} (n=${resource.nVersions})`}
          handleClick={() => setModalResource(resource)}
        />
      </TooltipWrapper>
    )
  }

  const description = resource.lastUpdated ? `Last known update on ${resource.lastUpdated}` : "";

  return (
    <Container ref={ref}>

      <FlexRow>

        <TooltipWrapper description={description}>
          <ResourceLinkWrapper onShiftClick={() => setModalResource(resource)}>
            <Name displayName={resource.displayName} href={resource.url} topOfColumn={topOfColumn}/>
          </ResourceLinkWrapper>
        </TooltipWrapper>

        {history}

      </FlexRow>

    </Container>
  )
}


/**
 * Wrapper component to add shift-click behavior.
 */
export const ResourceLinkWrapper = ({children, onShiftClick}) => {
  const onClick = (e) => {
    if (e.shiftKey) {
      onShiftClick();
      e.preventDefault(); // child elements (e.g. <a>) shouldn't receive the click
    }
  };
  return (
    <div onClick={onClick}>
      {children}
    </div>
  )
}
