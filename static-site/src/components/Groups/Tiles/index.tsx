import React, { useContext } from "react";
import * as Styles from "./styles";
import { width, height } from "./styles";
import Padlock from "./padlock";
import { theme } from "../../../layouts/theme";
import { UserContext } from "../../../layouts/userDataWrapper";
import { GroupTile } from "./types";
import { Group } from "../types";
import { ExpandableTiles } from "../../ExpandableTiles";


export const GroupTiles = () => {
  const { visibleGroups } = useContext(UserContext);
  return (
    <ExpandableTiles
      tiles={createGroupTiles(visibleGroups || [])}
      tileWidth={width}
      tileHeight={height}
      TileComponent={Tile}/>
  );
};


const createGroupTiles = (groups: Group[], colors = [...theme.titleColors]): GroupTile[] => groups.map((group) => {
  const groupColor = colors[0]!;
  colors.push(colors.shift()!);

  const tile: GroupTile = {
    img: "empty.png",
    url: `/groups/${group.name}`,
    name: group.name,
    color: groupColor,
    private: group.private
  };

  return tile;
});


const Tile = ({ tile }: { tile: GroupTile }) => {
  return (
    <Styles.TileOuter>
      <Styles.TileInner>
        <a href={`${tile.url}`}>
          <Styles.TileName>
            {tile.name}
          </Styles.TileName>
          {tile.private ? (
            <Styles.BottomRightLabel>
              <Padlock/>
            </Styles.BottomRightLabel>
          ) : null}
          {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
          {tile.img ? <Styles.TileImg src={require(`../../../../static/pathogen_images/${tile.img}`).default.src} alt={""} color={tile.color}/> : null}
        </a>
      </Styles.TileInner>
    </Styles.TileOuter>
  )
}
