"use client";

import React, { useContext } from "react";

import { ErrorBoundary } from "../../components/error-boundary";
import ExpandableTiles from "../../components/expandable-tiles";
import { GenericTileBase } from "../../components/expandable-tiles/types"
import { UserContext } from "../../components/user-data-wrapper";

import styles from "./group-tiles.module.css";

interface Group {
  /** the name of the group */
  name: string
  /** a boolean for whether this is a private group */
  private: boolean
}

interface GroupTile extends GenericTileBase {
  /** a color used to index into the `--titleColor` list of CSS vars */
  color: number
  /** image file name to use on the tile */
  img: string
  /** the name of the group */
  name: string
  /** a boolean for whether this is a private group */
  private: boolean
  /** the URL the tile should be linked to */
  url: string
}


/** height and width of a single tile */
const height = 160;
const width = 160;

/**
 * A React Client Component to display a set of tiles, where each tile
 * corresponds to a Nextstrain group.
 */
export default function GroupTiles(): React.ReactElement {
  /** the groups available to the logged-in user, if there is one */
  const { visibleGroups } = useContext(UserContext);

  return (
    <ErrorBoundary>
      <ExpandableTiles
        tiles={createGroupTiles(visibleGroups || [])}
        tileWidth={width}
        tileHeight={height}
        TileComponent={Tile}
      />
    </ErrorBoundary>
  );
}

/** A React Component that displays a padlock SVG image */
function Padlock(): React.ReactElement {
  return (
    <svg stroke="white" fill="white" width="16" height="19">
      <path
        fillRule="evenodd"
        d="M4 13H3v-1h1v1zm8-6v7c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h1V4c0-2.2 1.8-4 4-4s4 1.8 4 4v2h1c.55 0 1 .45 1 1zM3.8 6h4.41V4c0-1.22-.98-2.2-2.2-2.2-1.22 0-2.2.98-2.2 2.2v2H3.8zM11 7H2v7h9V7zM4 8H3v1h1V8zm0 2H3v1h1v-1z"
      />
    </svg>
  );
}

/** A React component corresponding to an individual `GroupTile` object */
function Tile({ tile }: { tile: GroupTile }): React.ReactElement {
  return (
    <div className={styles.tileOuter} style={{ height, width }}>
      <div className={styles.tileInner}>
        <a href={`${tile.url}`}>
          <div className={styles.tileName}>{tile.name}</div>

          {tile.private ? (
            <div className={styles.bottomRightLabel}>
              <Padlock />
            </div>
          ) : null}

          {tile.img ? (
            <img
              style={{ backgroundColor: `var(--titleColor${tile.color})` }}
              className={styles.tileImg}
              src={
                require(`../../static/pathogen_images/${tile.img}`).default
                  .src
              }
              alt={""}
            />
          ) : null}
        </a>
      </div>
    </div>
  );
}

/**
 * helper function to turn the visible groups into an array of
 * `GroupTile` objects, sorted by group name
 */
function createGroupTiles(groups: Group[]): GroupTile[] {
  // the index number of the `--titleColor` CSS var to use for this
  // particular tile; will cycle from 0 to 9 and then reset
  let color = 0;

  return groups
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((group) => {
      const tile: GroupTile = {
        img: "empty.png",
        url: `/groups/${group.name}`,
        name: group.name,
        color: color,
        private: group.private,
      };

      // rotate the color
      color = color === 9 ? 0 : color + 1;

      return tile;
    });
}
