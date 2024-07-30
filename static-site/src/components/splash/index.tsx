import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import ScrollableAnchor, { configureAnchors } from '../../../vendored/react-scrollable-anchor/index';
import { Heading } from "./heading";
import * as Styles from "./styles";
import { Tooltip } from 'react-tooltip-v5';
import { BigSpacer, HugeSpacer, FlexCenter, Line } from "../../layouts/generalComponents";
import Footer from "../Footer";
import { ExpandableTiles } from "../ExpandableTiles";
import * as featuredAnalyses from "../../../content/featured-analyses.yaml";
import { SplashTile } from "./types";

const Section = ({id, imgSrc, title, abstract, link}) => (
  <div id={id} className="col-12 col-md-6 col-lg-4" style={{paddingBottom: "20px"}}>
    <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
      <a href={link}>
        <SectionImage src={imgSrc} />
        <SectionHeader>{title}</SectionHeader>
      </a>
      <SectionAbstract style={{flexGrow: 1}}>
        {abstract}
      </SectionAbstract>
      <BigSpacer/>
    </div>
  </div>
);

const SectionHeader = styled.span`
  font-size: 25px;
  font-weight: 400;
`;

const SectionImage = styled.img`
  padding-right: 5px;

  // Vertically align with SectionHeader's font-size
  height: 20px;
  vertical-align: baseline;
  margin-bottom: -1px;
`;

const SectionAbstract = styled.div`
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 300;
  line-height: ${(props) => props.theme.tightLineHeight};
  margin-top: 5px;
`

const Splash = () => {
  useEffect(() => {
    configureAnchors({ offset: -10 });
  }, [])

  return (
    <Styles.Container>

      <BigSpacer />

      <Heading />

      <HugeSpacer/>

      <div style={{display: "flex", flexWrap: "wrap"}}>
        <Section
          id="about"
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          imgSrc={require("../../../static/logos/fa-circle-info-solid.svg").default.src}
          title="About us"
          abstract="An open-source project to harness the scientific and public health potential of pathogen genome data"
          link="https://docs.nextstrain.org/en/latest/learn/about.html"
        />
        <Section
          id="pathogens"
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          imgSrc={require("../../../static/logos/fa-viruses-solid.svg").default.src}
          title="Core pathogens"
          abstract="Continually updated views of a range of pathogens maintained by the Nextstrain team"
          link="/pathogens"
        />
        <Section
          id="sars-cov-2"
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          imgSrc={require("../../../static/logos/fa-virus-covid-solid.svg").default.src}
          title="SARS-CoV-2"
          abstract="Up-to-date analyses and a range of resources for SARS-CoV-2, the virus responsible for COVID-19 disease"
          link="/sars-cov-2"
        />
        <Section
          id="tooling"
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          imgSrc={require("../../../static/logos/fa-screwdriver-wrench-solid.svg").default.src}
          title="Open source tooling"
          abstract="Bioinformatic workflows, analysis tools and visualization apps for use by the community"
          link="https://docs.nextstrain.org/en/latest/install.html"
        />
        <Section
          id="nextclade"
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          imgSrc={require("../../../static/logos/nextclade-logo.svg").default.src}
          title="Nextclade"
          abstract="In-browser phylogenetic placement, clade assignment, mutation calling and sequence quality checks"
          link="https://clades.nextstrain.org"
        />
        <Section
          id="groups"
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          imgSrc={require("../../../static/logos/fa-users-solid.svg").default.src}
          title="Nextstrain Groups"
          abstract="Datasets and narratives shared by research labs, public health entities and others"
          link="/groups"
        />
      </div>

      <Styles.H1Small>
        Featured analyses
      </Styles.H1Small>

      <BigSpacer/>
      <ExpandableTiles tiles={featuredAnalyses as unknown as SplashTile[]} tileWidth={tileWidth} tileHeight={tileHeight} TileComponent={Tile} />
      <Tooltip style={{fontSize: '1.6rem'}} id={tooltipId} />

      {/* PHILOSOPHY */}
      <ScrollableAnchor id={'philosophy'}>
        <Styles.H1Small>Philosophy</Styles.H1Small>
      </ScrollableAnchor>
      <div className="row">
        <div className="col-lg-6">
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
        <div className="col-lg-6">
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
        <div className="col-lg-6">
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
        <div className="col-lg-6">
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
        <Styles.H1Small>A bioinformatics and data viz toolkit</Styles.H1Small>
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


/*** FEATURED ANALYSES ***/

const Tile = ({ tile }: {
  tile: SplashTile
}) => {

  /* Narrative detection works for all three sources:
  1. Core: /narratives/<narrative path>
  2. Community: /community/narratives/<owner>/<narrative path>
  3. Groups: /groups/<group>/narratives/<narrative path>

  Including slashes in the check prevents false positives.
  */
  const isNarrative = tile.url.includes('/narratives/');

  return (
    <TileOuter>
      <TileInner>
        <a href={tile.url}>
          <TileName>
            {tile.name}
          </TileName>
          <TileImgContainer>
            <TileImgWrapper filename={tile.img}/>
            <InfoIcons>
              <TileSourceIcon url={tile.url} isNarrative={isNarrative} />
              {isNarrative && <NarrativeIcon />}
            </InfoIcons>
          </TileImgContainer>
        </a>
        <TileDescription>
          {tile.description}
        </TileDescription>
      </TileInner>
    </TileOuter>
  )
}

const tileWidth = 220; // pixels
const tileHeight = 285; // pixels

function TileSourceIcon({ url, isNarrative }: {
  url: string
  isNarrative: boolean
}) {
  const nextstrainLogo = require(`../../../static/logos/nextstrain-logo-tiny.png`).default.src;

  let maintainers: string, image: React.JSX.Element;

  if (url.startsWith('/community')) {
    const owner = isNarrative ? url.split('/')[3] : url.split('/')[2];
    maintainers = `${owner} on GitHub`;
    image = <InfoIconImg src={`https://github.com/${owner}.png?size=40`} alt={maintainers} />;
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
  const faBookOpen = require(`../../../static/logos/fa-book-open-solid.svg`).default.src;

  return (
    <TooltipWrapper description='Analysis in the form of a narrative'>
      <InfoIconImg src={faBookOpen} alt='narrative' />
    </TooltipWrapper>

  )
}

const tooltipId = "featuredAnalysesTooltip";

function TooltipWrapper({description, children}: {
  description: string
  children: React.ReactNode
}) {
  return (
    <span
      data-tooltip-id={tooltipId}
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
  border-radius: 3px;
`;

const TileOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  width: ${tileWidth}px;
  height: ${tileHeight}px;
  border-radius: 10px;
  border: 1px solid #AAA;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TileInner = styled.div`
  margin: 5px 10px 5px 10px;
`;

const TileName = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: 20px;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 5px;
`;

const TileDescription = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
`;

const TileImgContainer = styled.div`
  position: relative;
`;

const TileImg = styled.img`
  object-fit: contain;
  max-height: 100%;
  width: 100%;
`;

const TileImgWrapper = ({filename}: {
  filename: string
}) => {
  let src;
  try {
    src = require(`../../../static/pathogen_images/${filename}`).default.src;
  } catch {
    src = require(`../../../static/pathogen_images/empty.png`).default.src;
  }
  return <TileImg src={src} alt={""} />
}
