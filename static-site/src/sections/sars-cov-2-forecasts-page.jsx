import React, { useState } from "react";
import Collapsible from "react-collapsible";
import styled from "styled-components";
import {
  SmallSpacer,
  MediumSpacer,
  FlexCenter,
  HugeSpacer
} from "../layouts/generalComponents";
import GenericPage from "../layouts/generic-page";
import CollapseTitle from "../components/Misc/collapse-title";
import * as splashStyles from "../components/splash/styles";
import { PathogenPageIntroduction } from "../components/Datasets/pathogen-page-introduction";


// Hard-coded content
const title = "Nextstrain SARS-CoV-2 Forecasts";
const abstract = (
  <>
    <>This page visualises the evolution and dynamics of SARS-CoV-2 evolution and dynamics using two models:</>
    <ul>
      <li>Multinomial Logistic Regression (MLR) estimates variant frequencies and growth advantages for variants against some baseline using sequence count data</li>
      <li>The variant renewal model estimates variant frequencies, variant-specific incidence, and growth advantages using a combination of case and sequence count data.</li>
    </ul>
    <br/>
    <>Each model uses sequence counts via GISAID and case counts from various sources, collated in our <a href="https://github.com/nextstrain/forecasts-ncov/tree/main/ingest">forecasts-ncov GitHub repo</a>.</>
    <>{` For more information on the models please see the `}<a href="https://www.github.com/blab/evofr">evofr GitHub repo</a> or the preprint <a href="https://bedford.io/papers/figgins-rt-from-frequency-dynamics/">"SARS-CoV-2 variant dynamics across US states show consistent differences in effective reproduction numbers"</a>.</>
    <br/>
    <>Currently we use <a href='https://nextstrain.org/blog/2022-04-29-SARS-CoV-2-clade-naming-2022'>Nextstrain clades</a> to partition the sequences into variants.</>
  </>
)

const introContents = [
  {
    type: "gatsby",
    to: "/sars-cov-2",
    title: "The main Nextstrain SARS-CoV-2 page",
  },
  {
    type: "external",
    to: "/sars-cov-2/forecasts/interactive",
    title: "Interactive visualisations of these forecasts",
  },
];

const collapsibleContents = [
  {
    title: "Estimated effective reproduction number over time",
    text: (
      <span>
        This is an estimate of the average number of secondary infections expected to be caused by an individual infected with a given variant as estimated by the variant renewal model.
        In general, we expect the variant to be growing if this number is greater than 1.
      </span>
    ),
    legend: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/legend.png",
    images: {
      nextstrainClades: {
        src: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/rtPanel.png",
        alt: "Global variant Rt plots from GISAID data"
      }
    }

  },
  {
    title: "Estimated Variant Frequencies over time",
    text: (
      <span>
        These estimates are derived from sequence count data using a multinomial logistic regression model.
      </span>
    ),
    legend: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/legend.png",
    images: {
      nextstrainClades: {
        src: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/frequenciesPanel.png",
        alt: "Global estimated variant frequency plots from GISAID data"
      }
    }
  },
  {
    title: "Estimated Cases over time",
    text: (
      <span>
        As estimated by the variant renewal model.
        These estimates are smoothed to deal with daily reporting noise and weekend effects present in case data.
      </span>
    ),
    legend: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/legend.png",
    images: {
      nextstrainClades: {
        src: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/smoothedIncidencePanel.png",
        alt: "Global estimated variant case plots from GISAID data"
      }
    }
  },
  {
    title: "Growth Advantage",
    text: (
      <span>
        These plots show the estimated growth advantage for given variants relative to baseline.
        This is an estimate of how many more secondary infections this variant causes on average compared the baseline variant as estimated but the multinomial logistic regression model.
        Vertical bars show the 95% HPD.
      </span>
    ),
    legend: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/legend.png",
    images: {
      nextstrainClades: {
        src: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/growthAdvantagePanel.png",
        alt: "Global relative growth advantage plots from GISAID data"
      }
    }
  }
];

const ResourcesTitle = styled(FlexCenter)`
  font-size: 20px;
  font-weight: 500;
`

function Index(props) {
  const [ cladeType, setCladeType ] = useState("nextstrainClades");

  return (
    <GenericPage location={props.location}>
      <splashStyles.H1>{title}</splashStyles.H1>
      <SmallSpacer />

      <FlexCenter>
        <splashStyles.CenteredFocusParagraph>
          {abstract}
        </splashStyles.CenteredFocusParagraph>
      </FlexCenter>
      <HugeSpacer />

      <ResourcesTitle>
        Other useful resources:
      </ResourcesTitle>
      <PathogenPageIntroduction data={introContents} />
      <HugeSpacer />

      {collapsibleContents.map((c) => <CollapsibleContent key={c.title} content={c} cladeType={cladeType} />)}
    </GenericPage>
  );
}

const FullWidthImage = styled.img`
  width: 100%;
  height: auto;
  min-width: 900px;
`;

function CollapsibleContent(props) {
  /* eslint no-shadow: "off" */
  const {title, text, images, legend} = props.content;


  return (
    <Collapsible
      triggerWhenOpen={<CollapseTitle name={title} isExpanded />}
      trigger={<CollapseTitle name={title} />}
      triggerStyle={{cursor: "pointer", textDecoration: "none"}}
      open={true}
    >
      <div style={{ padding: "10px" }} >
        <splashStyles.FocusParagraph>
          {text}
        </splashStyles.FocusParagraph>
        <MediumSpacer />
        <img alt="legend" src={legend} />
        <FullWidthImage
          src={images[props.cladeType]?.src}
          alt={images[props.cladeType]?.alt}
        />
      </div>
    </Collapsible>
  );
}

export default Index;
