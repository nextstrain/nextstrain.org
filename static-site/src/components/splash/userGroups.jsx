import React, { Fragment, useContext } from "react";
import ScrollableAnchor from "react-scrollable-anchor";
import * as Styles from "./styles";
import Cards from "../Cards";
import { HugeSpacer, FlexCenter } from "../../layouts/generalComponents";
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

const UserGroups = () => {
  // Right now this component is only used when we know we have a user
  const { user } = useContext(UserContext);
  return (
    <Fragment>
      <ScrollableAnchor id={'groups'}>
        <Styles.H1>Nextstrain Groups</Styles.H1>
      </ScrollableAnchor>

      <FlexCenter>
        <Styles.CenteredFocusParagraph>
          Nextstrain groups represent collections of datasets, potentially with controlled access.
          You (
          <Styles.StrongerText>{user.username}</Styles.StrongerText>
          ) have access to the following groups (a padlock icon indicates a private group):
        </Styles.CenteredFocusParagraph>
      </FlexCenter>

      <GroupCards squashed/>

      <HugeSpacer/>
    </Fragment>
  );
};

export default UserGroups;
