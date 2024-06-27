import React, { useEffect } from "react";
import styled from 'styled-components';
import ScrollableAnchor, { configureAnchors } from '../../../vendored/react-scrollable-anchor/index';
import Title from "./title";
import * as Styles from "./styles";
import { SmallSpacer, BigSpacer, HugeSpacer, FlexCenter, Line } from "../../layouts/generalComponents";
import Footer from "../Footer";
import { Showcase } from "../Showcase";
import { cards } from "./showcase.yaml";

const Section = ({id, title, abstract, buttonText, buttonLink}) => (
  <div id={id} className="col-md-6" style={{paddingBottom: "40px"}}>
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}}>
      <Styles.H1Small>{title}</Styles.H1Small>
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
      <Styles.H1Small> Real-time tracking of pathogen evolution </Styles.H1Small>
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

      <Styles.H1Small>
        Featured analyses
      </Styles.H1Small>

      <BigSpacer/>
      <Showcase cards={cards} cardWidth={cardWidthHeight} cardHeight={cardWidthHeight} CardComponent={UrlShowcaseTile} />

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
        <Styles.H1Small>Philosophy</Styles.H1Small>
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
      <Footer splashImagesCredit/>

    </Styles.Container>
  );
}

export default Splash;


/*** SHOWCASE ***/

const UrlShowcaseTile = ({ card }) => {
  return (
    <CardOuter>
      <CardInner>
        <a href={card.url}>
          <CardTitle $squashed>
            {card.name}
          </CardTitle>
          <CardImgWrapper filename={card.img}/>
        </a>
      </CardInner>
    </CardOuter>
  )
}

const cardWidthHeight = 160; // pixels

const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-width: ${cardWidthHeight}px;
  min-height: ${cardWidthHeight}px;
  max-width: ${cardWidthHeight}px;
  max-height: ${cardWidthHeight}px;
`

const CardInner = styled.div`
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`;

const CardTitle = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: ${(props) => props.$squashed ? "21px" : "25px"};
  @media (max-width: 768px) {
    font-size: 22px;
  }
  position: absolute;
  border-radius: 3px;
  padding: 10px 20px 10px 10px;
  top: 15px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`;

const CardImg = styled.img`
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 3px 3px 3px 1px rgba(0, 0, 0, 0.15);
  max-height: 100%;
  width: 100%;
  float: right;
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
