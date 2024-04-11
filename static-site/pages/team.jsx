
/**
 * 
 * Example of a typical/simple (?) page for Next.js (pages), i.e. no dynamic imports.
 */

import React from "react";
import styled from "styled-components";
import GenericPage from "../src/layouts/generic-page";
import { BigSpacer, FlexCenter} from "../src/layouts/generalComponents";
import { CenteredFocusParagraph } from "../src/components/splash/styles";
import { ListOfPeople } from "../src/components/People/avatars";

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

      <ListOfPeople people="founders" teamPage />

      <FlexCenter>
        <CenteredFocusParagraph>
          {"The core team currently working on Nextstrain are:"}
        </CenteredFocusParagraph>
      </FlexCenter>

      <ListOfPeople people="core" teamPage />

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

      <ListOfPeople people="alumni" teamPage />
    </div>
  );
};


const Team = props => (
  <GenericPage location={props.location} footerProps={{showTeamAvatars: false}}>
    <TeamPage/>
  </GenericPage>
);

export default Team;

