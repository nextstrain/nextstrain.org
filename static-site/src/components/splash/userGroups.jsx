import React, { Fragment } from "react";
import ScrollableAnchor from "react-scrollable-anchor";
import * as Styles from "./styles";
import Cards from "../Cards";
import { HugeSpacer, FlexCenter } from "../../layouts/generalComponents";
import { theme } from "../../layouts/theme";

const UserGroups = (props) => {

  const colors = [...theme.titleColors];

  const groupCards = props.user.groups.map((group) => {
    const groupColor = colors[0];
    colors.push(colors.shift());

    return (
      {
        img: "empty.png",
        url: `/groups/${group}`,
        title: group,
        color: groupColor
      }
    );
  });

  return (
    <Fragment>
      <ScrollableAnchor id={'groups'}>
        <Styles.H1>Private Nextstrain Groups</Styles.H1>
      </ScrollableAnchor>

      <FlexCenter>
        <Styles.CenteredFocusParagraph>
          Nextstrain groups are collections of datasets with controlled access.
          You ({props.user.username}) have access to the following groups:
        </Styles.CenteredFocusParagraph>
      </FlexCenter>

      <Cards cards={groupCards}/>

      <HugeSpacer/>
    </Fragment>
  );
};

export default UserGroups;
