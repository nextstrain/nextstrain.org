import React, { useState, useRef } from "react";
import Collapsible from "react-collapsible";
import styled from "styled-components";
import { isEqual } from "lodash";
import {
  SmallSpacer,
  MediumSpacer,
  FlexCenter,
  FlexGrid,
  HugeSpacer,
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
    type: "external",
    to: "/sars-cov-2",
    title: "Nextstrain SARS-CoV-2 resources",
    subtext: "Jump to our main SARS-CoV-2 resources page."
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
    images: {
      gisaid: {
        global: {
          src: "https://raw.githubusercontent.com/blab/rt-from-frequency-dynamics/master/results/omicron-countries-split/figures/omicron-countries-split_variant-rt.png",
          alt: "Global variant Rt plots from GISAID data"
        },
        usa: {
          src: "https://raw.githubusercontent.com/blab/rt-from-frequency-dynamics/master/results/omicron-us-split/figures/omicron-us-split_variant-rt.png",
          alt: "USA variant Rt plots from GISAID data"
        }
      },
      open: {
        global: {
          src: "https://via.placeholder.com/900/7FB3D5/fff.png?text=Variant+Rt+Global+placeholder",
          alt: "Global variant Rt plots from open data"
        },
        usa: {
          src: "https://via.placeholder.com/900/BB8FCE/000.png?text=Variant+Rt+USA+placeholder",
          alt: "USA variant Rt plots from open data"
        }
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
    images: {
      gisaid: {
        global: {
          src: "https://raw.githubusercontent.com/blab/rt-from-frequency-dynamics/master/results/omicron-countries-split/figures/omicron-countries-split_variant-estimated-frequency.png",
          alt: "Global estimated variant frequency plots from GISAID data"
        },
        usa: {
          src: "https://raw.githubusercontent.com/blab/rt-from-frequency-dynamics/master/results/omicron-us-split/figures/omicron-us-split_variant-estimated-frequency.png",
          alt: "USA estimated variant frequency plots from GISAID data"
        }
      },
      open: {
        global: {
          src: "https://via.placeholder.com/900/7FB3D5/fff.png?text=Variant+Rt+Global+placeholder",
          alt: "Global estimated variant frequency plots from open data"
        },
        usa: {
          src: "https://via.placeholder.com/900/BB8FCE/000.png?text=Variant+Rt+USA+placeholder",
          alt: "USA estimated variant frequency plots from open data"
        }
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
      gisaid: {
        global: {
          src: "https://raw.githubusercontent.com/blab/rt-from-frequency-dynamics/master/results/omicron-countries-split/figures/omicron-countries-split_variant-estimated-log-cases.png",
          alt: "Global estimated variant case plots from GISAID data"
        },
        usa: {
          src: "https://raw.githubusercontent.com/blab/rt-from-frequency-dynamics/master/results/omicron-us-split/figures/omicron-us-split_variant-estimated-log-cases.png",
          alt: "USA estimated variant case plots from GISAID data"
        }
      },
      open: {
        global: {
          src: "https://via.placeholder.com/900/7FB3D5/fff.png?text=Variant+Rt+Global+placeholder",
          alt: "Global estimated variant case plots from open data"
        },
        usa: {
          src: "https://via.placeholder.com/900/BB8FCE/000.png?text=Variant+Rt+USA+placeholder",
          alt: "USA estimated variant case plots from open data"
        }
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
    images: {
      gisaid: {
        global: {
          src: "https://via.placeholder.com/900/7FB3D5/fff.png?text=Global+relative+growth+advantage+placeholder",
          alt: "Global relative growth advantage plots from GISAID data"
        },
        usa: {
          src: "https://via.placeholder.com/900/BB8FCE/000.png?text=USA+relative+growth+advantage+placeholder",
          alt: "USA relative growth advantage plots from GISAID data"
        }
      },
      open: {
        global: {
          src: "https://via.placeholder.com/900/7FB3D5/fff.png?text=Variant+Rt+Global+placeholder",
          alt: "Global relative growth advantage plots from open data"
        },
        usa: {
          src: "https://via.placeholder.com/900/BB8FCE/000.png?text=Variant+Rt+USA+placeholder",
          alt: "USA relative growth advantage plots from open data"
        }
      }
    }
  }
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

      <PathogenPageIntroduction data={introContents} />
      <HugeSpacer />

      {collapsibleContents.map((c) => <CollapsibleContent key={c.title} content={c} />)}
    </GenericPage>
  );
}

const FullWidthImage = styled.img`
  width: 100%;
  height: auto;
  min-width: 900px;
`;

const ToggleButton = styled.button`
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.selected ? props.theme.brandColor : props.theme.darkGrey};
  border-radius: 5px;
  background-color: inherit;
  margin: 5px 5px 10px 5px;
  cursor: pointer;
  padding: 2px;
  color: ${(props) => props.selected ? props.theme.brandColor : props.theme.darkGrey};
  font-weight: 400;
  font-size: 16px;
  text-transform: uppercase;
  vertical-align: top;
  outline: 0;
`;

function CollapsibleContent(props) {
  /* eslint no-shadow: "off" */
  const {title, text, images} = props.content;
  const dataProvenanceOptions = Object.keys(images).sort();

  /**
   * Setting geoResolutionOptions as a ref because this can change depending on
   * the dataProvenance, but we don't want it to cause a re-render since the
   * actual selected option will cause the re-render
   */
  const geoResolutionOptions = useRef(Object.keys(images[dataProvenanceOptions[0]]).sort());
  const [imageOptions, setImageOptions] = useState({
    dataProvenance: dataProvenanceOptions[0],
    geoResolution: geoResolutionOptions.current[0]
  });

  function handleDataProvenanceChange(newDataProvenance) {
    const newGeoResolutionOptions = Object.keys(images[newDataProvenance]).sort();
    // Set the new geo-resolution options if it's different than the current ones
    if (!isEqual(geoResolutionOptions.current, newGeoResolutionOptions)) {
      geoResolutionOptions.current = newGeoResolutionOptions;
      // If the new geo-resolutions does not include the current selected geo-resolution,
      // then set the geo-resolution to the first option
      if (!newGeoResolutionOptions.includes(imageOptions.geoResolution)) {
        return setImageOptions({
          dataProvenance: newDataProvenance,
          geoResolution: newGeoResolutionOptions[0]
        });
      }
    }
    return setImageOptions({...imageOptions, dataProvenance: newDataProvenance});
  }

  function handleGeoResolutionChange(newGeoResolution) {
    setImageOptions({...imageOptions, geoResolution: newGeoResolution});
  }

  return (
    <Collapsible
      triggerWhenOpen={<CollapseTitle name={title} isExpanded />}
      trigger={<CollapseTitle name={title} />}
      triggerStyle={{cursor: "pointer", textDecoration: "none"}}
    >
      <div style={{ padding: "10px" }} >
        <splashStyles.FocusParagraph>
          {text}
        </splashStyles.FocusParagraph>
        <MediumSpacer />
        <FlexGrid>
          <div style={{ flex: "0 50%" }}>
            <splashStyles.H3>Data Provenance:</splashStyles.H3>
            <FlexCenter>
              {dataProvenanceOptions.map((option) => (
                <ToggleButton
                  key={option}
                  selected={imageOptions.dataProvenance===option}
                  onClick={() => handleDataProvenanceChange(option)}
                >
                  {option}
                </ToggleButton>
              ))}
            </FlexCenter>
          </div>
          <div style={{ flex: "0 50%" }}>
            <splashStyles.H3>Geo-Resolution:</splashStyles.H3>
            <FlexCenter>
              {geoResolutionOptions.current.map((option) => (
                <ToggleButton
                  key={option}
                  selected={imageOptions.geoResolution===option}
                  onClick={() => handleGeoResolutionChange(option)}
                >
                  {option}
                </ToggleButton>
              ))}
            </FlexCenter>
          </div>
        </FlexGrid>
        <FullWidthImage
          src={images[imageOptions.dataProvenance][imageOptions.geoResolution]?.src}
          alt={images[imageOptions.dataProvenance][imageOptions.geoResolution]?.alt}
        />
      </div>
    </Collapsible>
  );
}

export default Index;
