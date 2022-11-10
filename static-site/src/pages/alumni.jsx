import React from "react";
import styled from "styled-components";
import GenericPage from "../layouts/generic-page";
import { TeamMember, BigSpacer } from "../layouts/generalComponents";
import { CenteredFocusParagraph } from "../components/splash/styles";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-size: 16px;
  font-weight: 300;
  padding: 0px 5%;
  & img {
    width: 60px;
    margin-right: 20px !important;
  }
  & > span {
    padding-bottom: 15px;
  }
`;

const H1 = styled.div`
  text-align: center;
  font-size: 32px;
  line-height: 32px;
  font-weight: 300;
  color: ${(props) => props.theme.darkGrey};
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 30px;
`;

const AlumniPage = () => {
  console.log("<AlumniPage>");
  return (
    <div>

      <H1>Nextstrain Alumni</H1>

      <CenteredFocusParagraph>
        {"Our previous core Nextstrain team members. "}
        {"Beyond the core team there have been many code contributions from the wider scientific and programming community; please see "}
        <a href="https://github.com/nextstrain">our GitHub organization</a>
        {" to see the history of (code) contributions."}
      </CenteredFocusParagraph>

      <BigSpacer/>

      <Grid>
        <TeamMember name={"Kairsten Fay"} image={"kairsten-fay.jpg"} link={"http://bedford.io/team/kairsten-fay/"}/>
        <TeamMember name={"Moira Zuber"} image={"moira-zuber.jpg"}/>
        <TeamMember name={"Eli Harkins"} image={"eli-harkins.jpg"} link={"https://bedford.io/team/eli-harkins/"}/>
        <TeamMember name={"Misja Ilcisin"} image={"misja-ilcisin.jpg"} link={"http://bedford.io/team/misja-ilcisin/"}/>
        <TeamMember name={"Louise Moncla"} image={"louise-moncla.jpg"} link={"http://bedford.io/team/louise-moncla/"}/>
        <TeamMember name={"Allison Black"} image={"allison-black.jpg"} link={"http://bedford.io/team/allison-black/"}/>
        <TeamMember name={"Sidney Bell"} image={"sidney-bell.jpg"} link={"http://bedford.io/team/sidney-bell/"}/>
        <TeamMember name={"Colin Megill"} image={"colin-megill.jpg"} link={"http://www.colinmegill.com/"}/>
        <TeamMember name={"Barney Potter"} image={"barney-potter.jpg"} link={"http://bedford.io/team/barney-potter/"}/>
        <TeamMember name={"Pavel Sagulenko"} image={"pavel-sagulenko.jpg"} link={"https://neherlab.org/pavel-sagulenko.html"}/>
        <TeamMember name={"Charlton Callender"} image={"charlton-callender.jpg"} link={"http://bedford.io/team/charlton-callender/"}/>
      </Grid>
    </div>
  );
};


const Alumni = props => (
  <GenericPage location={props.location}>
    <AlumniPage/>
  </GenericPage>
);

export default Alumni;

