import { Tile } from "../../ExpandableTiles/types"

export interface GroupTile extends Tile {
  img: string
  url: string
  name: string
  color: string
  private: boolean
}
