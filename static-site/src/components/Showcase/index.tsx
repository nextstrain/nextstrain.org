/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styled from 'styled-components';
import { Tile } from './types';

const expandPreviewHeight = 60 //pixels
const transitionDuration = "0.3s"
const transitionTimingFunction = "ease"

interface ShowcaseProps<AnyTile extends Tile> {
    tiles: AnyTile[]
    tileWidth: number
    tileHeight: number
    TileComponent: React.FunctionComponent<{ tile: AnyTile }>
}

export const Showcase = <AnyTile extends Tile>({tiles, tileWidth, tileHeight, TileComponent}: ShowcaseProps<AnyTile>) => {

  const [tilesContainerHeight, setTilesContainerHeight] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Function that runs on changes to the container.
   * Used to determine the height upon resize.
   */
  function tilesContainerRef(tilesContainer: HTMLDivElement) {
    if (!tilesContainer) return;

    if(tilesContainerHeight != tilesContainer.clientHeight) {
      setTilesContainerHeight(tilesContainer.clientHeight)
    }
  }

  const isExpandable = tilesContainerHeight > tileHeight;

  return (
    <div>
      <ShowcaseContainer className={!isExpandable ? "" : isExpanded ? "expanded" : "collapsed"} $tileHeight={tileHeight} $expandedHeight={tilesContainerHeight}>
        <TilesContainer ref={tilesContainerRef} $tileWidth={tileWidth}>
          {tiles.map((el) => {
            return <TileComponent tile={el} key={el.name} />
          })}
        </TilesContainer>
        <PreviewOverlay onClick={toggleExpand} className={!isExpandable || isExpanded ? "hidden" : "visible"} />
      </ShowcaseContainer>
      {isExpandable && <>
        <ArrowButton onClick={toggleExpand}>
          {isExpanded ? <FaChevronUp/> : <FaChevronDown/>}
        </ArrowButton>
      </>}
      <Spacer/>
    </div>
  )
}

/**
 * NOTE: Many of the React components here are taken from the existing GroupTiles UI
 */

const ShowcaseContainer = styled.div<{$tileHeight: number, $expandedHeight: number}>`
  position: relative;
  overflow-y: hidden;

  &.collapsed {
    max-height: ${(props) => props.$tileHeight + expandPreviewHeight}px;
  }

  &.expanded {
    max-height: ${(props) => `${props.$expandedHeight}px`};
  }

  transition: max-height ${transitionDuration} ${transitionTimingFunction};
`

const ArrowButton = styled.div`
  text-align: center;
  font-size: 1.8rem;
  width: 100%;
  height: 1em;
  cursor: pointer;
`

const PreviewOverlay = styled.div`
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) -100%,
    rgba(255, 255, 255, 1) 100%);
  width: 100%;
  height: ${expandPreviewHeight}px;
  cursor: pointer;

  &.visible {
    opacity: 1;
  }

  &.hidden {
    opacity: 0;
  }

  transition: opacity ${transitionDuration} ${transitionTimingFunction};
`;

const TilesContainer = styled.div<{$tileWidth: number}>`
  display: grid;
  grid-template-columns: repeat(auto-fit, ${(props) => `${props.$tileWidth}px`});
  gap: 10px;
  overflow: hidden;
  justify-content: center;
`;

const Spacer = styled.div`
  min-height: 25px;
`
