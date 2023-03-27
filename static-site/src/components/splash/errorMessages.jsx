import React from 'react';
import * as splashStyles from "./styles";


const PleaseEmailUsIfYouBelieveThisToBeAnError = () => (
  <>Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a> if you believe this to be an error.</>
);

export const ErrorBanner = ({title, contents}) => (
  <splashStyles.FixedBanner backgroundColor="#c2c1be">
    <splashStyles.StrongerText>
      {title}
    </splashStyles.StrongerText>
    <br/>
    <PleaseEmailUsIfYouBelieveThisToBeAnError/>
    <p>{contents}</p>
  </splashStyles.FixedBanner>
);
