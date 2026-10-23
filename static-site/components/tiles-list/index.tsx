"use client";

import React from "react";

import { TilesListTile } from "./types";

import styles from "./styles.module.css";

/**
 * React Client Component that displays a vertical list of tiles. Each
 * tile spans the available horizontal space with its image on the left
 * and its text (title stacked above the description) on the right.
 */
export default function TilesList({
  tiles,
}: {
  /** the list of tiles to display, in order, top to bottom */
  tiles: TilesListTile[];
}): React.ReactElement {
  return (
    <div className={styles.list}>
      {tiles.map((tile) => (
        <div className={styles.tile} key={tile.title}>
          <TileImg filename={tile.img} />

          <div className={styles.tileText}>
            <div className={styles.tileTitle}>
              {tile.url ? <a href={tile.url}>{tile.title}</a> : tile.title}
            </div>
            <div className={styles.tileDescription}>{tile.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** React Client Component for the image displayed on a tile */
function TileImg({
  filename,
}: {
  /**
   * the file name of the image file to display, expected to be within
   * the `pathogen_images` directory
   */
  filename: string;
}): React.ReactElement {
  let src: string;
  try {
    src = require(`../../static/pathogen_images/${filename}`).default.src;
  } catch {
    src = require(`../../static/pathogen_images/empty.png`).default.src;
  }

  return <img className={styles.tileImg} src={src} alt={""} />;
}
