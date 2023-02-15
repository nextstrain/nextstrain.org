import React from "react";
import styled from "styled-components";
import { teamMembers } from "./teamMembers";

const CommonWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
    margin-right: 8px;
    width: 32px;
    height: 32px;
  }
`

const BodyWrapper = styled(CommonWrapper)`
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
  width: 360px;
`

const UpDown = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  justify-content: center;
`

const Name = styled.span`
  white-space: nowrap;
`;

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
  if (teamPage) {
    return (
      <AvatarContainer>
        <Sideways>
          <a href={link}><img alt={name} src={require("../../../static/team/"+image)}/></a>
          <UpDown>
            <a href={link}><Name>{name}</Name></a>
            {blurb && (
              <Blurb>{blurb}</Blurb>
            )}
          </UpDown>
        </Sideways>
        {comma && <Comma/>}
      </AvatarContainer>
    );
  }
  return (
    <>
      <a href={link}>
        <img alt={name} src={require("../../../static/team/"+image)}/>
        <Name>{name}</Name>
      </a>
      {comma && <Comma/>}
    </>
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
