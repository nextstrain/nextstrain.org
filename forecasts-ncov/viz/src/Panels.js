import React, {useRef} from 'react';
import styled from 'styled-components';
import { SmallMultiple } from "./SmallMultiple.js";
import {useLegend} from "./Legend.js"

const WINDOW_WIDTH_FOR_SIDEBAR_LEGEND = 1200;

const Container = styled.div`
  @media screen and (min-width: ${WINDOW_WIDTH_FOR_SIDEBAR_LEGEND}px) {
    margin-right: 100px; // + the 100px from <App> Container
  }
`;

const PanelSectionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

/**
 * styles chosen to match nextstrain.org
 */
const MainTitle = styled.div`
  text-align: center;
  font-size: 38px;
  line-height: 32px;
  min-width: 240px;
  margin-top: 4px;
  margin-bottom: 20px;
`

/**
 * font weight + size chosen to match nextstrain.org
 */
const PanelSectionHeaderContainer = styled.div`
  margin-bottom: 15px;
  margin-top: 50px;
  margin-left: 10%;
  margin-right: 10%;
  font-size: 20px;
  font-weight: 500;
`;

const PanelAbstract = styled.div`
  margin-top: 0px;
  margin-bottom: 30px;
  margin-left: 10%;
  margin-right: 10%;
`;

const LegendContainer = styled.div`
  /* border: solid red; */
  display: flex;

  /* legend-inline styles (which will be overridden by a media query if necessary) */
  position: block;
  flex-wrap: wrap;
  flex-direction: row;
  margin: 10px 0px;
  & > div {
    padding-right: 10px;
  }

  @media screen and (min-width: ${WINDOW_WIDTH_FOR_SIDEBAR_LEGEND}px) {
    position: fixed;
    right: 0px;
    max-width: 200px;
    min-width: 200px;
    flex-wrap: nowrap;
    flex-direction: column;
    & > div {
      padding-right: 0px;
    }
  }
`;


const useResponsiveSizing = () => {
  /* following are in pixel coordinates */
  const width = 250;
  const height = 200;
  /* control the spacing around graphs via the margin of each graph */
  const margin = {top: 5, right: 20, bottom: 40, left: 40}
  const fontSize = "10px";

  return {width, height, margin, fontSize};
}

export const Panels = ({modelData, sidebar}) => {

  const sizes = useResponsiveSizing();
  const legendContainer = useRef(null);
  useLegend(legendContainer, modelData); // renders the legend

  return (
    <Container id="mainPanelsContainer" >

      <MainTitle>
        Nextstrain SARS-CoV-2 Forecasts
      </MainTitle>

      <PanelAbstract>
        <>This page visualises the evolution and dynamics of SARS-CoV-2 evolution and dynamics using two models:</>
        <ul>
          <li>Multinomial Logistic Regression (MLR) estimates variant frequencies and growth advantages for variants against some baseline using sequence count data</li>
          <li>The variant renewal model estimates variant frequencies, variant-specific incidence, and growth advantages using a combination of case and sequence count data.</li>
        </ul>
        <>Each model uses sequence counts via GISAID and case counts from various sources, collated in our <a href="https://github.com/nextstrain/forecasts-ncov/tree/main/ingest">forecasts-ncov GitHub repo</a>.</>
        <>{` For more information on the models please see the `}<a href="https://www.github.com/blab/evofr">evofr GitHub repo</a> or the preprint <a href="https://bedford.io/papers/figgins-rt-from-frequency-dynamics/">"SARS-CoV-2 variant dynamics across US states show consistent differences in effective reproduction numbers"</a>.</>
        <br/><br/>
        <>Currently we use <a href='https://nextstrain.org/blog/2022-04-29-SARS-CoV-2-clade-naming-2022'>Nextstrain clades</a> to partition the sequences into variants.</>
      </PanelAbstract>

      <PanelSectionHeaderContainer>
        {`Estimated Variant Frequencies over time`}
      </PanelSectionHeaderContainer>
      <PanelAbstract>
        {`These estimates are derived from sequence count data using a multinomial logistic regression model.`}
      </PanelAbstract>

      {/* To do - the only appears once, however the intention is that on small screens
      it should appear above _every_ <PanelSectionContainer/> */}
      <LegendContainer id="legend" ref={legendContainer}/>

      <PanelSectionContainer id="frequenciesPanel">
        {modelData.get('locations')
          .map((location) => ({location, graph: "freq", sizes}))
          .map((param) => (
            <SmallMultiple {...param} key={`${param.graph}_${param.location}`} modelData={modelData}/>
          ))
        }
      </PanelSectionContainer>

      <PanelSectionHeaderContainer>
        {`Growth Advantage`}
      </PanelSectionHeaderContainer>
      <PanelAbstract>
        {`
          These plots show the estimated growth advantage for given variants relative to ${modelData.get("variantDisplayNames").get(modelData.get("pivot")) || "baseline"}.
          This is an estimate of how many more secondary infections this variant causes on average compared the baseline variant as estimated but the multinomial logistic regression model.
          Vertical bars show the 95% HPD.
        `}
      </PanelAbstract>
      <PanelSectionContainer id="growthAdvantagePanel">
        {modelData.get('locations')
          .map((location) => ({location, graph: "ga", sizes}))
          .map((param) => (
            <SmallMultiple {...param} key={`${param.graph}_${param.location}`} modelData={modelData}/>
          ))
        }
      </PanelSectionContainer>

      <PanelSectionHeaderContainer>
        {`Estimated Cases over time`}
      </PanelSectionHeaderContainer>
      <PanelAbstract>
        {`As estimated by the variant renewal model.
        These estimates are smoothed to deal with daily reporting noise and weekend effects present in case data.`}
      </PanelAbstract>
      <PanelSectionContainer id="smoothedIncidencePanel">
        {modelData.get('locations')
          .map((location) => ({location, graph: "stackedIncidence", sizes}))
          .map((param) => (
            <SmallMultiple {...param} key={`${param.graph}_${param.location}`} modelData={modelData}/>
          ))
        }
      </PanelSectionContainer>

      <PanelSectionHeaderContainer>
        {`Estimated effective reproduction number over time`}
      </PanelSectionHeaderContainer>
      <PanelAbstract>
        {`This is an estimate of the average number of secondary infections expected to be caused by an individual infected with a given variant as estimated by the variant renewal model.
        In general, we expect the variant to be growing if this number is greater than 1.`}
      </PanelAbstract>
      <PanelSectionContainer id="rtPanel">
      {modelData.get('locations')
          .map((location) => ({location, graph: "r_t", sizes}))
          .map((param) => (
            <SmallMultiple {...param} key={`${param.graph}_${param.location}`} modelData={modelData}/>
          ))
        }
      </PanelSectionContainer>

    </Container>
  )
}
