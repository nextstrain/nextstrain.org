import { Tile } from "../ExpandableTiles/types"

export interface SplashTile extends Tile {
  name: string
  description: string
  img: string
  url: string
}
