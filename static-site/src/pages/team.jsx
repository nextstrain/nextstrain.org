import React from "react";
import styled from "styled-components";
import GenericPage from "../layouts/generic-page";
import { TeamMember, BigSpacer, FlexCenter} from "../layouts/generalComponents";
import { CenteredFocusParagraph } from "../components/splash/styles";

/**
 * Todo - we would like a brief sentence or two describing what people work on
 * (or worked on) here. We need to both write the sentence and then render this
 * (only in the grid, not in the footer).
 */

export const teamMembers = [
  {name: "Trevor Bedford", image: "trevor-bedford.jpg", link: "http://bedford.io/team/trevor-bedford/"},
  {name: "Richard Neher", image: "richard-neher.jpg", link: "https://neherlab.org/richard-neher.html"},
  {name: "James Hadfield", image: "james-hadfield.jpg", link: "http://bedford.io/team/james-hadfield/"},
  {name: "Emma Hodcroft", image: "emma-hodcroft.jpg", link: "http://emmahodcroft.com/"},
  {name: "Thomas Sibley", image: "thomas-sibley.jpg", link: "https://bedford.io/team/thomas-sibley/"},
  {name: "John Huddleston", image: "john-huddleston.jpg", link: "http://bedford.io/team/john-huddleston/"},
  {name: "Ivan Aksamentov", image: "ivan-aksamentov.jpg", link: "https://neherlab.org/ivan-aksamentov.html"},
  {name: "Jover Lee", image: "jover-lee.jpg", link: "http://bedford.io/team/jover-lee/"},
  {name: "Jennifer Chang", image: "jennifer-chang.jpg", link: "https://bedford.io/team/jennifer-chang/"},
  {name: "Victor Lin", image: "victor-lin.png", link: "https://bedford.io/team/victor-lin/"},
  {name: "Cornelius Roemer", image: "cornelius-roemer.jpg", link: "https://neherlab.org/cornelius-roemer.html"},
];

const alumni = [
  {name: "Cassia Wagner", image: "cassia-wagner.jpg", link: "https://bedford.io/team/cassia-wagner/"},
  {name: "Miguel Parades", image: "miguel-parades.jpg", link: "https://bedford.io/team/miguel-parades/"},
  {name: "Kairsten Fay", image: "kairsten-fay.jpg", link: "http://bedford.io/team/kairsten-fay/"},
  {name: "Moira Zuber", image: "moira-zuber.jpg"},
  {name: "Eli Harkins", image: "eli-harkins.jpg", link: "https://bedford.io/team/eli-harkins/"},
  {name: "Misja Ilcisin", image: "misja-ilcisin.jpg", link: "http://bedford.io/team/misja-ilcisin/"},
  {name: "Louise Moncla", image: "louise-moncla.jpg", link: "http://bedford.io/team/louise-moncla/"},
  {name: "Allison Black", image: "allison-black.jpg", link: "http://bedford.io/team/allison-black/"},
  {name: "Sidney Bell", image: "sidney-bell.jpg", link: "http://bedford.io/team/sidney-bell/"},
  {name: "Colin Megill", image: "colin-megill.jpg", link: "http://www.colinmegill.com/"},
  {name: "Barney Potter", image: "barney-potter.jpg", link: "http://bedford.io/team/barney-potter/"},
  {name: "Pavel Sagulenko", image: "pavel-sagulenko.jpg", link: "https://neherlab.org/pavel-sagulenko.html"},
  {name: "Charlton Callender", image: "charlton-callender.jpg", link: "http://bedford.io/team/charlton-callender/"},
]

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-size: 16px;
  font-weight: 300;
  padding: 20px 5%;
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
  margin-bottom: 20px;
`;

const TeamPage = () => {
  console.log("<TeamPage>");
  return (
    <div>
      <H1>Nextstrain core team</H1>
      <FlexCenter>
        <CenteredFocusParagraph>
          {"The core team currently working on Nextstrain are:"}
        </CenteredFocusParagraph>
      </FlexCenter>

      <Grid>
        {teamMembers.map((p, i) => 
          <TeamMember key={p.name} name={p.name} image={p.image} link={p.link}/>
        )}
      </Grid>

      <H1>Nextstrain Alumni</H1>
      <FlexCenter>
        <CenteredFocusParagraph>
          {"Our previous core Nextstrain team members, some of whom are still working on projects involving Nextstrain and/or maintaining specific analyses."}
          {"Beyond the core team there have been many code contributions from the wider scientific and programming community; please see "}
          <a href="https://github.com/nextstrain">our GitHub organization</a>
          {" to see the history of (code) contributions."}
        </CenteredFocusParagraph>
      </FlexCenter>

      <BigSpacer/>

      <Grid>
        {alumni.map((p, i) => 
          <TeamMember key={p.name} name={p.name} image={p.image} link={p.link}/>
        )}
      </Grid>
    </div>
  );
};


const Team = props => (
  <GenericPage location={props.location}>
    <TeamPage/>
  </GenericPage>
);

export default Team;

