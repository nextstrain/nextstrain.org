import React from 'react';
import { FlexCenter } from "../../layouts/generalComponents";
import * as splashStyles from "./styles";

const PleaseEmailUsIfYouBelieveThisToBeAnError = () => (
  <p>Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a> if you believe this to be an error.</p>
);

export const BannerIfGroupsDatasetNotFound = ({missingDatasetName, groupName}) => (
  <>{missingDatasetName &&
    <FlexCenter>
      <splashStyles.CenteredFocusParagraph>
        {`The dataset "nextstrain.org/groups/${groupName}/${missingDatasetName}" doesn't exist.
          Here is the groups page for the "${groupName}" group.`}
        <PleaseEmailUsIfYouBelieveThisToBeAnError/>
      </splashStyles.CenteredFocusParagraph>
    </FlexCenter>}
  </>
);

export const GroupNotFound = ({groupName}) => (
  <FlexCenter>
    <splashStyles.CenteredFocusParagraph>
      {`The Nextstrain Group "${groupName}" doesn't exist yet, or there was an error getting data for that group. `}
      For available Nextstrain Groups, check out the <a href="/groups">Groups page</a>.
      <PleaseEmailUsIfYouBelieveThisToBeAnError/>
    </splashStyles.CenteredFocusParagraph>
  </FlexCenter>
);
