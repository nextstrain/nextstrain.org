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
    font-weight: 300 !important;
    color: #333 !important;
    margin-left: 2px;
    margin-right: 2px;
  }
`

const FooterWrapper = styled(CommonWrapper)`
  & img {
    margin-right: 4px;
    width: 32px;
  }
`

const BodyWrapper = styled(CommonWrapper)`
  font-size: 16px;
  padding: 20px 5%;
  & img {
    margin-right: 20px;
    width: 60px;
  }
  & > span {
    padding: 5px 10px;
  }
`

const Avatar = ({name, image, link, comma=false}) => {
  return (
    <span>
      <a href={link}>
        <img alt={name} src={require("../../../static/team/"+image)}/>
        {name}
      </a>
      {comma && ","}
    </span>
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
        <Avatar key={p.name} {...p} comma={!teamPage && i+1!==ppl.length}/>
      )}
    </Wrapper>
  )
}
