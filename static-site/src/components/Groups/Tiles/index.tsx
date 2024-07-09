import React, { useContext } from "react";
import * as Styles from "./styles";
import { H1 } from "../../splash/styles";
import { MediumSpacer } from "../../../layouts/generalComponents";
import Padlock from "./padlock";
import { theme } from "../../../layouts/theme";
import { UserContext } from "../../../layouts/userDataWrapper";
import { GroupTile } from "./types";
import { Group } from "../types";


export const GroupTiles = ({squashed}: { squashed: boolean }) => {
  const { visibleGroups } = useContext(UserContext);
  return (
    <Tiles
      compactColumns={false}
      title={""}
      tiles={createGroupTiles(visibleGroups || [])}
      squashed={squashed}/>
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


const Tiles = ({ compactColumns, title, subtext, tiles, squashed }: {
  compactColumns: boolean
  title: string
  subtext?: string
  tiles: GroupTile[]
  squashed: boolean
}) => {
  function getTiles(bootstrapColumnSize: number) {
    return tiles.map((d) => (
      <div className={`col-sm-${bootstrapColumnSize}`} key={d.name}>
        <Styles.TileOuter $squashed={squashed}>
          <Styles.TileInner>
            <a href={`${d.url}`}>
              <Styles.TileName $squashed={squashed}>
                {d.name}
              </Styles.TileName>
              {d.private ? (
                <Styles.BottomRightLabel>
                  <Padlock/>
                </Styles.BottomRightLabel>
              ) : null}
              {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
              {d.img ? <Styles.TileImg src={require(`../../../../static/splash_images/${d.img}`).default.src} alt={""} color={d.color}/> : null}
            </a>
          </Styles.TileInner>
        </Styles.TileOuter>
      </div>
    ));
  }

  const bootstrapColumnSize = compactColumns ? 6 : 4;
  const TILES = getTiles(bootstrapColumnSize);

  return compactColumns ? TILES : (
    <div>
      <div className="row">
        <div className="col-md-1" />
        <div className="col-md-10">
          <H1>{title}</H1>
          {subtext ?
            (
              <Styles.SubText>
                {subtext}
              </Styles.SubText>
            ) :
            null
          }
          <MediumSpacer />
          <div className="row">
            {TILES}
          </div>
        </div>
      </div>
      <div className="col-md-1" />
    </div>
  );
}
