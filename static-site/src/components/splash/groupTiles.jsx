import React, { useContext } from "react";
import Tiles from "../Tiles";
import { theme } from "../../layouts/theme";
import { UserContext } from "../../layouts/userDataWrapper";

const createGroupTiles = (groups, colors = [...theme.titleColors]) => groups.map((group) => {
  const groupColor = colors[0];
  colors.push(colors.shift());

  return (
    {
      img: "empty.png",
      url: `/groups/${group.name}`,
      name: group.name,
      color: groupColor,
      private: group.private
    }
  );
});

export const GroupTiles = ({squashed}) => {
  const { visibleGroups } = useContext(UserContext);
  return (
    <Tiles tiles={createGroupTiles(visibleGroups || [])} squashed={squashed}/>
  );
};
