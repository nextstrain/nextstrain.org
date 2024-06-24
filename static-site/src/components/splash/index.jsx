import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import ScrollableAnchor, { configureAnchors } from '../../../vendored/react-scrollable-anchor/index';
import Title from "./title";
import * as Styles from "./styles";
import { Tooltip } from 'react-tooltip-v5';
import { SmallSpacer, BigSpacer, HugeSpacer, FlexCenter, Line } from "../../layouts/generalComponents";
import Footer from "../Footer";
import { Showcase } from "../Showcase";
import { cards } from "./showcase.yaml";

const Section = ({id, title, abstract, buttonText, buttonLink}) => (
  <div id={id} className="col-md-6" style={{paddingBottom: "40px"}}>
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}}>
      <Styles.H1>{title}</Styles.H1>
      <Styles.CenteredFocusParagraph style={{flexGrow: 1}}>
        {abstract}
      </Styles.CenteredFocusParagraph>
      <BigSpacer/>
      <Styles.Button to={buttonLink}>
        {buttonText}
      </Styles.Button>
    </div>
  </div>
);


const Splash = () => {
  useEffect(() => {
    configureAnchors({ offset: -10 });
  }, [])

  return (
    <Styles.Container className="container">

      <BigSpacer />
      <FlexCenter>
        <Title />
      </FlexCenter>

      <HugeSpacer />
      <Styles.H1> Real-time tracking of pathogen evolution </Styles.H1>
      <SmallSpacer />

      <FlexCenter>
        <Styles.CenteredFocusParagraph>
          Nextstrain is an open-source project to harness the scientific and public health
          potential of pathogen genome data. We provide a continually-updated view of publicly
          available data alongside powerful analytic and visualization tools for use by the
          community. Our goal is to aid epidemiological understanding and improve outbreak
          response. If you have any questions, please <a href="/contact">contact us</a>.
        </Styles.CenteredFocusParagraph>
      </FlexCenter>

      <BigSpacer/>

      <FlexCenter>
        <Styles.Button to="#philosophy">
          Read More
        </Styles.Button>
      </FlexCenter>

      <HugeSpacer/>

      <Styles.H1>
        Featured analyses
      </Styles.H1>

      <BigSpacer/>
      <Showcase cards={cards} cardWidth={cardWidth} cardHeight={cardHeight} CardComponent={UrlShowcaseTile} />
      <Tooltip style={{fontSize: '1.6rem'}} id="showcaseTooltip" />

      <BigSpacer/>

      <div style={{display: "flex", justifyContent: "space-evenly", flexWrap: "wrap"}}>
        <Section
          id="sars-cov-2"
          title="SARS-CoV-2 (COVID-19)"
          abstract="We are incorporating SARS-CoV-2 genomes as soon as they are shared and providing analyses and situation reports.
          In addition we have developed a number of resources and tools, and are facilitating independent groups to run their own analyses."
          buttonText="See all resources"
          buttonLink="/sars-cov-2"
        />
        <Section
          id="nextclade"
          title="Nextclade"
          abstract="Nextclade allows you to analyze virus genome sequences in the web browser. It will align your sequence data to a reference genome, call mutations relative to that reference, and place your sequences on a phylogeny. It also reports clade assignments and quality of your sequence data."
          buttonText="Go to Nextclade"
          buttonLink="https://clades.nextstrain.org"
        />
        <Section
          id="groups"
          title="Nextstrain Groups"
          abstract="We want to enable research labs, public health entities and others to share their datasets and narratives through Nextstrain with complete control of their data and audience."
          buttonText="See all groups"
          buttonLink="/groups"
        />
        <Section
          id="pathogens"
          title="Explore pathogens"
          abstract="Genomic analyses of specific pathogens kept up-to-date by the Nextstrain team."
          buttonText="See all pathogens"
          buttonLink="/pathogens"
        />
        <Section
          id="community"
          title="From the community"
          abstract={(<>
            Analyses by independent groups <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html">stored and
            accessed via public GitHub repos</a>
          </>)}
          buttonText="Learn more"
          buttonLink="/community"
        />
        <Section
          id="narratives"
          title="Narratives"
          abstract="Narratives are a method of data-driven storytelling. They allow authoring of content which is displayed alongside a view into the data."
          buttonText="Find out more"
          buttonLink="https://docs.nextstrain.org/en/latest/guides/communicate/narratives-intro.html"
        />
      </div>

      <HugeSpacer/>

      {/* PHILOSOPHY */}
      <ScrollableAnchor id={'philosophy'}>
        <Styles.H1>Philosophy</Styles.H1>
      </ScrollableAnchor>
      <div className="row">
        <div className="col-md-6">
          <BigSpacer/>
          <Styles.H2>Pathogen Phylogenies</Styles.H2>
          <Styles.FocusParagraph>
            In the course of an infection and over an epidemic, pathogens naturally accumulate
            random mutations to their genomes. This is an inevitable consequence of error-prone
            genome replication. Since different genomes typically pick up different mutations,
            mutations can be used as a marker of transmission in which closely related genomes
            indicate closely related infections. By reconstructing a <i>phylogeny</i> we can learn
            about important epidemiological phenomena such as spatial spread, introduction timings
            and epidemic growth rate.
          </Styles.FocusParagraph>
        </div>
        <div className="col-md-6">
          <BigSpacer/>
          <Styles.H2>Actionable Inferences</Styles.H2>
          <Styles.FocusParagraph>
            However, if pathogen genome sequences are going to inform public health interventions,
            then analyses have to be rapidly conducted and results widely disseminated. Current
            scientific publishing practices hinder the rapid dissemination of epidemiologically
            relevant results. We thought an open online system that implements robust
            bioinformatic pipelines to synthesize data from across research groups has the best
            capacity to make epidemiologically actionable inferences.
          </Styles.FocusParagraph>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <BigSpacer/>
          <Styles.H2>This Website</Styles.H2>
          <Styles.FocusParagraph>
            This website aims to provide a <i>real-time</i> snapshot of evolving pathogen
            populations and to provide interactive data visualizations to virologists,
            epidemiologists, public health officials and citizen scientists. Through interactive
            data visualizations, we aim to allow exploration of continually up-to-date datasets,
            providing a novel surveillance tool to the scientific and public health communities.
          </Styles.FocusParagraph>
        </div>
        <div className="col-md-6">
          <BigSpacer/>
          <Styles.H2>Future Directions</Styles.H2>
          <Styles.FocusParagraph>
            Nextstrain is under active development and we have big plans for its future, including
            visualization, bioinformatics analysis and an increasing number and variety of
            datasets. If you have any questions or ideas, please <a href="/contact">contact us</a>.
          </Styles.FocusParagraph>
        </div>
      </div>

      {/* Bioinformatics toolkit */}
      <HugeSpacer/>

      <ScrollableAnchor id={'tools'}>
        <Styles.H1>A bioinformatics and data viz toolkit</Styles.H1>
      </ScrollableAnchor>

      <FlexCenter>
        <Styles.CenteredFocusParagraph>
          Nextstrain provides an open-source toolkit enabling the bioinformatics and visualization
          you see on this site. Tweak our analyses and create your own using the same tools we do.
          We aim to empower the wider genomic epidemiology and public health communities.
        </Styles.CenteredFocusParagraph>
      </FlexCenter>

      <BigSpacer/>

      <FlexCenter>
        <Styles.Button to="https://docs.nextstrain.org/en/latest/index.html">
          Read the documentation
        </Styles.Button>
      </FlexCenter>

      <Line style={{ margin: "30px 0px 10px 0px" }} />
      <Footer />

    </Styles.Container>
  );
}

export default Splash;


/*** SHOWCASE ***/

const UrlShowcaseTile = ({ card }) => {

  /* Narrative detection works for all three sources:
  1. Core: /narratives/<narrative path>
  2. Community: /community/narratives/<owner>/<narrative path>
  3. Groups: /groups/<group>/narratives/<narrative path>

  Including slashes in the check prevents false positives.
  */
  const isNarrative = card.url.includes('/narratives/');

  return (
    <CardOuter>
      <CardInner>
        <a href={card.url}>
          <CardTitle>
            {card.name}
          </CardTitle>
          <CardImgContainer>
            <CardImgWrapper filename={card.img}/>
            <InfoIcons>
              <CardSourceIcon url={card.url} isNarrative={isNarrative} />
              {isNarrative && <NarrativeIcon />}
            </InfoIcons>
          </CardImgContainer>
        </a>
        <CardDescription>
          {card.description}
        </CardDescription>
      </CardInner>
    </CardOuter>
  )
}

const cardWidth = 220; // pixels
const cardHeight = 285; // pixels

function CardSourceIcon({ url, isNarrative }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gitHubLogo = require(`../../../static/logos/github-mark.png`).default.src;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nextstrainLogo = require(`../../../static/logos/nextstrain-logo-tiny.png`).default.src;

  let maintainers, image;

  if (url.startsWith('/community')) {
    const owner = isNarrative ? url.split('/')[3] : url.split('/')[2];
    maintainers = `${owner} on GitHub`;
    image = <InfoIconImg src={gitHubLogo} alt={maintainers} />;
  }
  else if (url.startsWith('/groups')) {
    const group = url.split('/')[2];
    maintainers = `the ${group} group`;
    // Ideally just the image src is parameterized, but the async call to get
    // the group logo must be done within useEffect in a functional component.
    image = <GroupImage group={group} />;
  }
  // Assume everything else is Nextstrain
  else {
    maintainers = 'the Nextstrain team';
    image = <InfoIconImg src={nextstrainLogo} alt={maintainers} />;
  }

  return (
    <TooltipWrapper description={`Maintained by ${maintainers}`}>
      {image}
    </TooltipWrapper>
  );
}

function GroupImage({ group }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const faUsers = require(`../../../static/logos/fa-users-solid.svg`).default.src;
  const [groupLogo, setGroupLogo] = useState(faUsers);

  useEffect(() => {
    async function getGroupLogo(group) {
      const response = await fetch(`/charon/getSourceInfo?prefix=/groups/${group}`);
      const data = await response.json();
      if (data.avatar) {
        setGroupLogo(data.avatar);
      }
    }

    getGroupLogo(group);
  }, [group]);

  return (
    <InfoIconImg src={groupLogo} alt={group} />
  );
}

function NarrativeIcon() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const faBookOpen = require(`../../../static/logos/fa-book-open-solid.svg`).default.src;

  return (
    <TooltipWrapper description='Analysis in the form of a narrative'>
      <InfoIconImg src={faBookOpen} alt='narrative' />
    </TooltipWrapper>

  )
}

function TooltipWrapper({description, children}) {
  return (
    <span
      data-tooltip-id="showcaseTooltip"
      data-tooltip-html={description}
      data-tooltip-place="top">
      {children}
    </span>
  )
}

const InfoIcons = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 1px;
  padding-right: 1px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 6px 0;
  border: 0px;
`;

const InfoIconImg = styled.img`
  width: 20px;
  margin: 0 3px;
`;

const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  width: ${cardWidth}px;
  height: ${cardHeight}px;
  border-radius: 10px;
  border: 1px solid #AAA;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardInner = styled.div`
  margin: 5px 10px 5px 10px;
`;

const CardTitle = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: 20px;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 5px;
`;

const CardDescription = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
`;

const CardImgContainer = styled.div`
  position: relative;
`;

const CardImg = styled.img`
  object-fit: contain;
  max-height: 100%;
  width: 100%;
`;

const CardImgWrapper = ({filename}) => {
  let src;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/${filename}`).default.src;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/empty.png`).default.src;
  }
  return <CardImg src={src} alt={""} />
}
