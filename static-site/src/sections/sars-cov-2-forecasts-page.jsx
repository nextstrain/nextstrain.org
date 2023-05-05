import React, { useState } from "react";
import Collapsible from "react-collapsible";
import styled from "styled-components";
import {
  SmallSpacer,
  CenteredContainer,
  HugeSpacer
} from "../layouts/generalComponents";
import GenericPage from "../layouts/generic-page";
import CollapseTitle from "../components/Misc/collapse-title";
import * as splashStyles from "../components/splash/styles";

const gisaidLogo = require("../../static/logos/gisaid.png");

// Hard-coded content
const disclaimer = "DISCLAIMER: This page is an alpha release of model results";
const title = "Nextstrain SARS-CoV-2 Forecasts";
const abstract = (
  <>
    <>Here we chart the change in frequency of SARS-CoV-2 variants over time. We use this change in
    frequency to estimate the relative growth advantage or evolutionary fitness of different
    variants. We apply a Multinomial Logistic Regression (MLR) model to estimate frequencies and
    growth advantages using daily sequence counts. We apply this model independently across
    different countries and partition SARS-CoV-2 variants by <a
    href="https://nextstrain.org/blog/2022-04-29-SARS-CoV-2-clade-naming-2022">Nextstrain
    clades</a>. Each clade is assumed to have a fixed growth advantage relative to clade 22B (lineage BA.5).</>
    <p/>
    <>Further details on data preparation and analysis can be found in the <a
    href="https://github.com/nextstrain/forecasts-ncov/">forecasts-ncov GitHub repo</a>, while
    further details on the MLR model implementation can be found in the <a
    href="https://www.github.com/blab/evofr">evofr GitHub repo</a>. Enabled by data from <a
    href="https://gisaid.org/"><img alt="GISAID" src={gisaidLogo} width={70}/></a>.</>
    <br/>
    <p/>
    <>
    These analyses are the work of <a
    href="https://bedford.io/team/marlin-figgins/">Marlin Figgins</a>, <a
    href="https://bedford.io/team/jover-lee/">Jover Lee</a>, <a
    href="https://bedford.io/team/james-hadfield/">James Hadfield</a> and <a
    href="https://bedford.io/team/trevor-bedford/">Trevor Bedford</a>.
    </>
  </>
)
const acknowledgement = (
  <>
    We gratefully acknowledge the authors, originating and submitting laboratories of the genetic
    sequences and metadata made available through GISAID on which this research is based.
  </>
)

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
    title: "Estimated variant frequencies over time",
    text: (
      <span>
        Each line represents the estimated frequency of a particular clade through time.
        Equivalent Pango lineage is given in parenthesis, eg clade 22B (lineage BA.5).
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
        These plots show the estimated growth advantage for given variants relative to clade 22B (lineage BA.5). This
        describes how many more secondary infections a variant causes on average relative to clade 22B.
        Vertical bars show the 95% HPD.
      </span>
    ),
    images: {
      nextstrainClades: {
        alt: "Global relative growth advantage plots from GISAID data",
        ...generatePictureSrcs(nextstrainCladesSrcBase, "growthAdvantagePanel")
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

      <CenteredContainer>
        <splashStyles.FocusParagraph>
          {abstract}
        </splashStyles.FocusParagraph>
      </CenteredContainer>
      <HugeSpacer />

      {collapsibleContents.map((c) => <CollapsibleContent key={c.title} content={c} cladeType={cladeType} />)}

      <CenteredContainer>
        <splashStyles.FocusParagraph>
          {acknowledgement}
        </splashStyles.FocusParagraph>
      </CenteredContainer>
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
  const {title, text, images} = props.content;

  return (
    <Collapsible
      triggerWhenOpen={<CollapseTitle name={title} isExpanded />}
      trigger={<CollapseTitle name={title} />}
      triggerStyle={{cursor: "pointer", textDecoration: "none"}}
      open={true}
    >
      <div style={{ padding: "10px" }} >
        <splashStyles.WideParagraph style={{ marginTop: "0px" }} >
          {text}
        </splashStyles.WideParagraph>
        <HugeSpacer />
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
