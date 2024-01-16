import React, { useState } from "react";
import Collapsible from "react-collapsible";
import styled from "styled-components";
import {
  SmallSpacer,
  CenteredContainer,
  HugeSpacer
} from "../layouts/generalComponents";
import GenericPage from "../layouts/generic-page";
import * as splashStyles from "../components/splash/styles";

const gisaidLogo = require("../../static/logos/gisaid.png");

// Hard-coded content
// const disclaimer = "DISCLAIMER: This page is an alpha release of model results";
const title = "Nextstrain SARS-CoV-2 Forecasts";
const abstract = (
  <>
    <>Here we chart the change in frequency of SARS-CoV-2 variants over time. We use this change in
    frequency to estimate the relative growth advantage or evolutionary fitness of different
    variants. We apply a Multinomial Logistic Regression (MLR) model to estimate frequencies and
    growth advantages using daily sequence counts. We apply this model independently across
    different countries and partition SARS-CoV-2 variants by <a
    href="https://nextstrain.org/blog/2022-04-29-SARS-CoV-2-clade-naming-2022">Nextstrain
    clades</a> and separately by <a href="https://cov-lineages.org/">Pango lineages</a>.</>
    <p/>
    <>Further details on data preparation and analysis can be found in the <a
    href="https://github.com/nextstrain/forecasts-ncov/">forecasts-ncov GitHub repo</a>, while
    further details on the MLR model implementation can be found in the <a
    href="https://www.github.com/blab/evofr">evofr GitHub repo</a>. Enabled by data from <a
    href="https://gisaid.org/"><img alt="GISAID" src={gisaidLogo} width={70}/></a>.</>
    <p/>
    <>These analyses are the work of <a
    href="https://bedford.io/team/marlin-figgins/">Marlin Figgins</a>, <a
    href="https://bedford.io/team/jover-lee/">Jover Lee</a>, <a
    href="https://bedford.io/team/james-hadfield/">James Hadfield</a> and <a
    href="https://bedford.io/team/trevor-bedford/">Trevor Bedford</a>.</>
    <p/>
    <><i>Multinomial Logistic Regression is commonly used to model SARS-CoV-2 variant frequencies.
    However, please apply caution in interpretation of these results.</i></>
  </>
)
const acknowledgement = (
  <>
    We gratefully acknowledge the authors, originating and submitting laboratories of the genetic
    sequences and metadata made available through GISAID on which this research is based.
  </>
)

function Index(props) {
  return (
    <GenericPage location={props.location}>
      <splashStyles.H1>{title}</splashStyles.H1>
      <SmallSpacer />

      <CenteredContainer>
        <splashStyles.FocusParagraph>
          {abstract}
        </splashStyles.FocusParagraph>
      </CenteredContainer>
      <HugeSpacer />

      <IFrameContainer>
        <ResponsiveIFrame src="https://nextstrain.github.io/forecasts-ncov/">
        </ResponsiveIFrame>
      </IFrameContainer>

      <CenteredContainer>
        <splashStyles.FocusParagraph>
          {acknowledgement}
        </splashStyles.FocusParagraph>
      </CenteredContainer>
    </GenericPage>
  );
}

// not currently used, but may restore
// const DisclaimerBanner = () => {
//   return (
//     <splashStyles.FixedBanner backgroundColor="#ffedcc">
//       <splashStyles.StrongerText>
//         {disclaimer}
//       </splashStyles.StrongerText>
//     </splashStyles.FixedBanner>
//   )
// }

// padding-top: 72% chosen so that at widescreen the iframe takes up basically the entire height of the window
// padding-top: 580px chosen so that at vertical mobile display the iframe takes up basically the entire height of the window
const IFrameContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-top: max(580px, 72%);
`;

const ResponsiveIFrame = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border: 0px;
`;

export default Index;
