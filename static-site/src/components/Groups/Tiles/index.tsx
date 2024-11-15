import React, { useContext } from "react";
import * as Styles from "./styles";
import { width, height } from "./styles";
import Padlock from "./padlock";
import { theme } from "../../../layouts/theme";
import { UserContext } from "../../../layouts/userDataWrapper";
import { GroupTile } from "./types";
import { Group } from "../types";
import { ExpandableTiles } from "../../ExpandableTiles";
import { ErrorBoundary, InternalError } from "../../ErrorBoundary";


export const GroupTiles = () => {
  return (
    <ErrorBoundary>
      <GroupTilesUnhandled />
    </ErrorBoundary>
  );
};

const GroupTilesUnhandled = () => {
  const { visibleGroups } = useContext(UserContext);
  return (
    <ExpandableTiles
      tiles={createGroupTiles(visibleGroups || [])}
      tileWidth={width}
      tileHeight={height}
      TileComponent={Tile}/>
  );
};


function createGroupTiles(groups: Group[], colors = [...theme.titleColors]): GroupTile[] {
  return groups
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((group) => {
      if (colors[0] === undefined) {
        throw new InternalError("Colors are missing.");
      }
      const groupColor = colors[0];
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
}


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
          {tile.img ? <Styles.TileImg src={require(`../../../../static/pathogen_images/${tile.img}`).default.src} alt={""} color={tile.color}/> : null}
        </a>
      </Styles.TileInner>
    </Styles.TileOuter>
  )
}
