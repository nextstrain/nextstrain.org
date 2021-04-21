import React from "react";
import styled from 'styled-components';
import { StyledLink } from "../Datasets/list-datasets";
import { FlexCenter } from "../../layouts/generalComponents";

const OverviewContainer = styled.div`
  text-align: justify;
  font-size: 16px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: var(--darkGrey);
  line-height: 1.42857143;
  margin: 0px auto 0px auto;
  max-width: 900px;
`;

function Title({avatarSrc, children}) {
  if (!children) return null;
  const AvatarImg = styled.img`
    width: 140px;
    margin-right: 20px;
    object-fit: contain;
  `;
  const TitleDiv = styled.div`
    && {
      font-weight: 500;
      font-size: 26px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  `;
  return (
    <div style={{display: "flex", justifyContent: "start", padding: "50px 0px 20px 0px"}}>
      {avatarSrc ?
        <AvatarImg alt="avatar" src={avatarSrc}/> :
        null
      }
      <TitleDiv>
        {children}
      </TitleDiv>
    </div>
  );
}

function Byline({children}) {
  if (!children) return null;
  const Div = styled.div`
    && {
      font-size: 18px;
      font-weight: 400;
      line-height: 1.428;
      color: #A9ADB1;
    }
  `;
  return (<Div>{children}</Div>);
}

export default function GroupHeading({sourceInfo}) {
  return (
    <>
      <FlexCenter>
        <Title avatarSrc={sourceInfo.avatar}>
          {sourceInfo.title}
          <Byline>{sourceInfo.byline}</Byline>
          {sourceInfo.website &&
            <div style={{fontSize: "18px"}}>
              <StyledLink href={sourceInfo.website}>{sourceInfo.website.replace(/(^\w+:|^)\/\//, '')}</StyledLink>
            </div>}
        </Title>
      </FlexCenter>
      {sourceInfo.overview &&
        <FlexCenter>
          <OverviewContainer>
            {sourceInfo.overview}
          </OverviewContainer>
        </FlexCenter>
      }
    </>);
}
