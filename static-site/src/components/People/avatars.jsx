import React from "react";
import styled from "styled-components";
import { teamMembers } from "./teamMembers";

const CommonWrapper = styled.div`
  & img {
    margin-left: 5px;
    border-radius: 50%;
    vertical-align: middle;
  }
  & a {
    font-weight: 500 !important;
    color: #333 !important;
  }
`

const FooterWrapper = styled(CommonWrapper)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  & img {
    margin-right: 8px;
    width: 32px;
    height: 32px;
  }
`

const BodyWrapper = styled(CommonWrapper)`
  display: grid;
  justify-content: center;
  grid-template-columns: minmax(min-content, 500px);

  /* Bootstrap's .container applies 25px left and right margins.  Account for
   * that when computing the minimum width to support two 333px columns.
   */
  @media (min-width: ${333*2 + 25*2}px) {
    grid-template-columns: repeat(auto-fit, 333px);
  }

  padding: 20px 0px;
  font-size: 18px;
  & img {
    margin-right: 20px;
    width: 60px;
    height: 60px;
  }
  & > div {
    padding: 10px 15px;
  }
`

const Sideways = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
`

const UpDown = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  justify-content: top;
`

const Name = styled.span`
  white-space: nowrap;
`;

const Blurb = styled.div`
  font-size: 14px;
  text-align: left;
`

const Comma = () => (
  <span style={{marginLeft: "2px", marginRight: "2px"}}>
    ,
  </span>
)

export const TeamPageList = ({membersKey}) => {

  const people = teamMembers[membersKey];

  return (
    <BodyWrapper>
      {people.map((person) => 
        <Sideways key={person.name} style={{alignItems: person.blurb ? "top" : "center"}}>
          <a href={person.link}><img alt={person.name} src={require("../../../static/team/"+person.image).default.src}/></a>
          <UpDown>
            <a href={person.link}><Name>{person.name}</Name></a>
            {person.blurb && (
              <Blurb>{person.blurb}</Blurb>
            )}
          </UpDown>
        </Sideways>
      )}
    </BodyWrapper>
  )
}

export const FooterList = () => {
  const people = [...teamMembers['founders'], ...teamMembers['core']];

  return (
    <FooterWrapper>
      {people.map((person, i) => 
        <div key={person.name}>
          <a href={person.link}>
            <img alt={person.name} src={require("../../../static/team/"+person.image).default.src}/>
            <Name>{person.name}</Name>
          </a>
          {i+1!==people.length && <Comma/>}
        </div>
      )}
    </FooterWrapper>
  )
}
