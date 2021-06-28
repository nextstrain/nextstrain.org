import React from 'react';
import styled from 'styled-components';
import * as splashStyles from "./styles";

const FixedBanner = styled.div`
  left: 0px;
  width: 100%;
  height: 10%;
  background-color: #c2c1be;
  font-size: 18px;
  padding: 5% 5%;
  margin: 25px 0px;
  text-align: center;
`;

const PleaseEmailUsIfYouBelieveThisToBeAnError = () => (
  <>Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a> if you believe this to be an error.</>
);

export const ErrorBanner = ({title, contents}) => (
  <FixedBanner>
    <splashStyles.StrongerText>
      {title}
    </splashStyles.StrongerText>
    <br/>
    <PleaseEmailUsIfYouBelieveThisToBeAnError/>
    <p>{contents}</p>
  </FixedBanner>
);
