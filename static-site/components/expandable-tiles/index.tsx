"use client";

import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import { GenericTileBase } from "./types";

import styles from "./styles.module.css";

/**
 * Number of pixels by which to pad out the container height when the
 * container is collapsed
 */
const expandPreviewHeight = 60;

/**
 * React Client Component to display an expandable div with a list of tiles.
 */
export default function ExpandableTiles<Tile extends GenericTileBase>({
  tiles,
  tileWidth,
  tileHeight,
  TileComponent,
}: {
  /** the list of tiles to display */
  tiles: Tile[];

  /** width of an individual tile in pixels */
  tileWidth: number;

  /** height of an individual tile in pixels */
  tileHeight: number;

  /** React Functional Component to render an individual tile */
  TileComponent: React.FunctionComponent<{ tile: Tile }>;
}): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  function _toggleExpand(): void {
    setIsExpanded(!isExpanded);
  }

  const [tilesContainerHeight, setTilesContainerHeight] = useState<number>(0);

  function tilesContainerRef(tilesContainer: HTMLDivElement): void {
    if (
      tilesContainer &&
      tilesContainerHeight !== tilesContainer.clientHeight
    ) {
      setTilesContainerHeight(tilesContainer.clientHeight);
    }
  }

  const isExpandable = tilesContainerHeight > tileHeight;

  return (
    <div>
      <div
        className={styles.expandableContainer}
        style={{
          maxHeight: isExpanded
            ? `${tilesContainerHeight}px`
            : `${tileHeight + expandPreviewHeight}px`,
        }}
      >
        <div
          ref={tilesContainerRef}
          className={styles.tilesContainer}
          style={{ gridTemplateColumns: `repeat(auto-fit, ${tileWidth}px)` }}
        >
          {tiles.map((el) => {
            return <TileComponent tile={el} key={el.name} />;
          })}
        </div>

        {isExpandable && !isExpanded && (
          <div
            onClick={_toggleExpand}
            className={styles.previewOverlay}
            style={{ height: `${expandPreviewHeight}px` }}
          />
        )}
      </div>

      {isExpandable && (
        <div className={styles.arrowButton} onClick={_toggleExpand}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      )}
      <div className={styles.spacer} />
    </div>
  );
}
