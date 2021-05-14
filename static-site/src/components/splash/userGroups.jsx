import React, { Fragment, useContext } from "react";
import ScrollableAnchor from "react-scrollable-anchor";
import * as Styles from "./styles";
import Cards from "../Cards";
import { HugeSpacer, FlexCenter } from "../../layouts/generalComponents";
import { theme } from "../../layouts/theme";
import { UserContext } from "../../layouts/userDataWrapper";

const UserGroups = () => {
  const colors = [...theme.titleColors];

  const userContext = useContext(UserContext);

  const groupCards = userContext.visibleGroups.map((group) => {
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

  return (
    <Fragment>
      <ScrollableAnchor id={'groups'}>
        <Styles.H1>Nextstrain Groups</Styles.H1>
      </ScrollableAnchor>

      <FlexCenter>
        <Styles.CenteredFocusParagraph>
          Nextstrain groups represent collections of datasets, potentially with controlled access.
          You (
          <Styles.StrongerText>{userContext.user.username}</Styles.StrongerText>
          ) have access to the following groups (a padlock icon indicates a private group):
        </Styles.CenteredFocusParagraph>
      </FlexCenter>

      <Cards cards={groupCards} squashed/>

      <HugeSpacer/>
    </Fragment>
  );
};

export default UserGroups;
