import React from 'react';
import styled from "styled-components";
import { CenteredFocusParagraph } from "../components/splash/styles";
import { ErrorBannerInitialMessage, DataFetchError } from '../../data/SiteConfig';

export const ErrorBanner = ({title, contents}) => (
  <FixedBanner $backgroundColor="#c2c1be">
    <StrongerText>
      {title}
    </StrongerText>
    <br/>
    <ErrorBannerInitialMessage />
    <p>{contents}</p>
  </FixedBanner>
);

export const DataFetchErrorParagraph = () => (
  <CenteredFocusParagraph>
    <DataFetchError />
  </CenteredFocusParagraph>
);

export const FixedBanner = styled.div`
  left: 0px;
  width: 100%;
  height: 10%;
  background-color: ${(props) => props.$backgroundColor};
  font-size: 18px;
  padding: 25px 0px 25px 0px;
  margin: 25px 0px 25px 0px;
  text-align: center;
`;

export const StrongerText = styled.span`
  font-weight: 500;
`;
