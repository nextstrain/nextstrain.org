import React, { useContext } from "react";
import Cards from "../Cards";
import { theme } from "../../layouts/theme";
import { UserContext } from "../../layouts/userDataWrapper";

const createGroupCards = (groups, colors = [...theme.titleColors]) => groups.map((group) => {
  const groupColor = colors[0];
  colors.push(colors.shift());

  return (
    {
      img: "empty.png",
      url: `/groups/${group.name}`,
      title: group.name,
      color: groupColor,
      private: group.private
    }
  );
});

export const GroupCards = ({squashed}) => {
  const { visibleGroups } = useContext(UserContext);
  return (
    <Cards cards={createGroupCards(visibleGroups || [])} squashed={squashed}/>
  );
};
