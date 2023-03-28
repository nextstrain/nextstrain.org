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
const disclaimer = "DISCLAIMER: This page is an alpha release of model results";
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
    type: "external",
    to: "/sars-cov-2",
    title: "Nextstrain SARS-CoV-2 resources",
    subtext: "Jump to our main SARS-CoV-2 resources page."
  },
];


const nextstrainCladesSrcBase = "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global";
const generatePictureSrcs = (srcBase, figureName) => {
  // media min-widths taken from the cut-offs for the .container class in static-site/src/styles/bootstrap.css
  return {
    srcSets: [
      {
        media: "(min-width: 1550px)",
        srcSet: `${srcBase}/${figureName}_xlarge.png`
      },
      {
        media: "(min-width: 1200px)",
        srcSet: `${srcBase}/${figureName}_large.png`
      },
      {
        media: "(min-width: 992px)",
        srcSet: `${srcBase}/${figureName}_medium.png`
      }
    ],
    imgSrc: `${srcBase}/${figureName}_small.png`
  }
};

const collapsibleContents = [
  {
    title: "Estimated Variant Frequencies over time",
    text: (
      <span>
        These estimates are derived from sequence count data using a multinomial logistic regression model.
      </span>
    ),
    images: {
      nextstrainClades: {
        alt: "Global estimated variant frequency plots from GISAID data",
        ...generatePictureSrcs(nextstrainCladesSrcBase, "frequenciesPanel")
      }
    }
  },
  {
    title: "Growth Advantage",
    text: (
      <span>
        These plots show the estimated growth advantage for given variants relative to BA.2.
        This is an estimate of how many more secondary infections this variant causes on average compared the baseline variant as estimated but the multinomial logistic regression model.
        Vertical bars show the 95% HPD.
      </span>
    ),
    images: {
      nextstrainClades: {
        alt: "Global relative growth advantage plots from GISAID data",
        ...generatePictureSrcs(nextstrainCladesSrcBase, "growthAdvantagePanel")
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
    images: {
      nextstrainClades: {
        alt: "Global estimated variant case plots from GISAID data",
        ...generatePictureSrcs(nextstrainCladesSrcBase, "smoothedIncidencePanel")
      }
    }
  },
  {
    title: "Estimated effective reproduction number over time",
    text: (
      <span>
        This is an estimate of the average number of secondary infections expected to be caused by an individual infected with a given variant as estimated by the variant renewal model.
        In general, we expect the variant to be growing if this number is greater than 1.
      </span>
    ),
    images: {
      nextstrainClades: {
        alt: "Global variant Rt plots from GISAID data",
        ...generatePictureSrcs(nextstrainCladesSrcBase, "rtPanel")
      }
    }

  }
];


function Index(props) {
  const [ cladeType, setCladeType ] = useState("nextstrainClades");

  return (
    <GenericPage location={props.location} banner={DisclaimerBanner()}>
      <splashStyles.H1>{title}</splashStyles.H1>
      <SmallSpacer />

      <FlexCenter>
        <splashStyles.CenteredFocusParagraph>
          {abstract}
        </splashStyles.CenteredFocusParagraph>
      </FlexCenter>
      <MediumSpacer />

      <PathogenPageIntroduction data={introContents} />
      <HugeSpacer />

      {collapsibleContents.map((c) => <CollapsibleContent key={c.title} content={c} cladeType={cladeType} />)}
    </GenericPage>
  );
}

const DisclaimerBanner = () => {
  return (
    <splashStyles.FixedBanner backgroundColor="#ffedcc">
      <splashStyles.StrongerText>
        {disclaimer}
      </splashStyles.StrongerText>
    </splashStyles.FixedBanner>
  )
}

const FullWidthPicture = styled.picture`
  width: 100%;
  height: auto;
  display: block;
  text-align: center;
  > img {
    max-width: 100%;
  }
`;

function CollapsibleContent(props) {
  /* eslint no-shadow: "off" */
  const {title, text, images} = props.content;

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
        <FullWidthPicture>
          {images[props.cladeType]?.srcSets
            ? images[props.cladeType].srcSets
                .map((source) => <source key={source.srcset} media={source.media} srcSet={source.srcSet}/>)
            : null
          }
          <img
            src={images[props.cladeType]?.imgSrc}
            alt={images[props.cladeType]?.alt} />
        </FullWidthPicture>

      </div>
    </Collapsible>
  );
}

export default Index;
