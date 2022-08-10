import React from "react";
import {
  SmallSpacer,
  MediumSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { PathogenPageIntroduction } from "../components/Datasets/pathogen-page-introduction";

import GenericPage from "../layouts/generic-page";

const title = "Nextstrain SARS-CoV-2 Forecasts";
const abstract = `Forecasts abstract placeholder`;

const contents = [
  {
    type: "external",
    to: "/sars-cov-2",
    title: "SARS-CoV-2 resources",
    subtext: "Jump to our main SARS-CoV-2 resources page."
  },
];

function Index(props) {
  return (
    <GenericPage location={props.location}>
      <splashStyles.H1>{title}</splashStyles.H1>
      <SmallSpacer />

      <FlexCenter>
        <splashStyles.CenteredFocusParagraph>
          {abstract}
        </splashStyles.CenteredFocusParagraph>
      </FlexCenter>
      <MediumSpacer />

      <PathogenPageIntroduction data={contents} />

    </GenericPage>
  );
}

export default Index;
