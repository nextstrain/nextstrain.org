import React from 'react';
import * as splashStyles from "./styles";
import { ErrorBannerInitialMessage, DataFetchError } from '../../../data/SiteConfig';

export const ErrorBanner = ({title, contents}) => (
  <splashStyles.FixedBanner backgroundColor="#c2c1be">
    <splashStyles.StrongerText>
      {title}
    </splashStyles.StrongerText>
    <br/>
    <ErrorBannerInitialMessage />
    <p>{contents}</p>
  </splashStyles.FixedBanner>
);

export const DataFetchErrorParagraph = () => (
  <splashStyles.CenteredFocusParagraph>
    <DataFetchError />
  </splashStyles.CenteredFocusParagraph>
);
