import React from "react";
import styled from "styled-components";
import GenericPage from "../layouts/generic-page";
import { BigSpacer, FlexCenter} from "../layouts/generalComponents";
import { CenteredFocusParagraph } from "../components/splash/styles";
import { TeamPageList } from "../components/People/avatars";

const H1 = styled.div`
  text-align: center;
  font-size: 32px;
  line-height: 32px;
  font-weight: 300;
  color: ${(props) => props.theme.darkGrey};
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 20px;
`;

const TeamPage = () => {
  console.log("<TeamPage>");
  return (
    <div>
      <H1>Nextstrain core team</H1>

      <FlexCenter>
        <CenteredFocusParagraph>
          {"Nextstrain was co-founded by:"}
        </CenteredFocusParagraph>
      </FlexCenter>

      <TeamPageList membersKey="founders" />

      <FlexCenter>
        <CenteredFocusParagraph>
          {"The core team currently working on Nextstrain are:"}
        </CenteredFocusParagraph>
      </FlexCenter>

      <TeamPageList membersKey="core" />

      <H1>Nextstrain Alumni</H1>
      <FlexCenter>
        <CenteredFocusParagraph>
          {`Our previous core Nextstrain team members, some of whom are still working on projects involving Nextstrain and/or maintaining specific analyses. `}
          {"Beyond the core team there have been many code contributions from the wider scientific and programming community; please see "}
          <a href="https://github.com/nextstrain">our GitHub organization</a>
          {" to see the history of (code) contributions."}
        </CenteredFocusParagraph>
      </FlexCenter>

      <BigSpacer/>

      <TeamPageList membersKey="alumni" />

      <H1>Scientific Advisory Board</H1>
      <FlexCenter>
        <CenteredFocusParagraph>
          {`In Oct 2023, a scientific advisory board was founded to provide guidance on future directions for the Nextstrain project.`}
        </CenteredFocusParagraph>
      </FlexCenter>

      <TeamPageList membersKey="board" />
    </div>
  );
};


const Team = props => (
  <GenericPage location={props.location}>
    <TeamPage/>
  </GenericPage>
);

export default Team;

