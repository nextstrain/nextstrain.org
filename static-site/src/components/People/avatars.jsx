import React from "react";
import styled from "styled-components";
import { teamMembers } from "./teamMembers";

const CommonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  & span {
    white-space: nowrap;
  }
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
  & img {
    margin-right: 4px;
    width: 32px;
    height: 32px;
  }
`

const BodyWrapper = styled(CommonWrapper)`
  padding: 20px 0px;
  & span {
    font-size: 18px;
  }
  & img {
    margin-right: 20px;
    width: 60px;
    height: 60px;
  }
  & > div {
    padding: 10px 15px;
  }
  & img > div {
    font-size: 50px;
  }
`

const Sideways = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
`

const AvatarContainer = styled(Sideways)`
  max-width: 40%;
`

const UpDown = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  justify-content: center;
`

const Blurb = styled.div`
  font-size: 14px;
  text-align: left;
`

const Comma = ({}) => (
  <span style={{marginLeft: "2px", marginRight: "2px"}}>
    ,
  </span>
)

const Avatar = ({name, image, link, blurb, teamPage, comma=false}) => {
  const summary = teamPage && blurb;
  return (
    <AvatarContainer>
      <a href={link}>
        <Sideways>
          <img alt={name} src={require("../../../static/team/"+image)}/>
          <UpDown>
            <span>{name}</span>
            {summary && (
              <Blurb>{blurb}</Blurb>
            )}
          </UpDown>
        </Sideways>
      </a>
      {comma && <Comma/>}
    </AvatarContainer>
  );
};

export const ListOfPeople = ({people, teamPage=false}) => {

  const ppl = people==="current" ?
    [...teamMembers['founders'], ...teamMembers['core']] :
    teamMembers[people];

  const Wrapper = teamPage ? BodyWrapper : FooterWrapper;

  return (
    <Wrapper>
      {ppl.map((p, i) => 
        <Avatar key={p.name} {...p} teamPage={teamPage} comma={!teamPage && i+1!==ppl.length}/>
      )}
    </Wrapper>
  )
}
