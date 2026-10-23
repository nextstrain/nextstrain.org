import React from "react";

export interface TilesListTile {
  /**
   * file name of the image to display on the left of the tile, expected
   * to be within the `pathogen_images` directory
   */
  img: string;

  /** the title displayed above the description */
  title: string;

  /** the description displayed below the title */
  text: React.ReactNode;

  /** optional URL the tile's title should link to */
  url?: string;
}
