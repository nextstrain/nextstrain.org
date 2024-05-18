import React from "react";
import ScrollableAnchor, { configureAnchors } from '../../../vendored/react-scrollable-anchor/index';
import Link from 'next/link'
import Cards from "../Cards";
import nCoVCards from "../Cards/nCoVCards";
import coreCards from "../Cards/coreCards";
import communityDatasets from "../../../content/community-datasets.yaml";
import narrativeCards from "../Cards/narrativeCards";
import Title from "./title";
import * as Styles from "./styles";
import { SmallSpacer, BigSpacer, HugeSpacer, FlexCenter, Line } from "../../layouts/generalComponents";
import Footer from "../Footer";
import { createGroupCards } from "./groupCards";
import { UserContext } from "../../layouts/userDataWrapper";

const Section = ({id, title, abstract, cards, buttonText, buttonLink}) => (
  <div id={id} className="col-md-6" style={{paddingBottom: "40px"}}>
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}}>
      <Styles.H1>{title}</Styles.H1>
      <Styles.CenteredFocusParagraph style={{flexGrow: 1}}>
        {abstract}
      </Styles.CenteredFocusParagraph>
      <div style={{display: "flex", justifyContent: "space-evenly", flexWrap: "wrap"}}>
        <Cards
          squashed
          compactColumns
          cards={cards}
        />
      </div>
      <BigSpacer/>
      <Styles.Button to={buttonLink}>
        {buttonText}
      </Styles.Button>
    </div>
  </div>
);


class Splash extends React.Component {
  constructor() {
    super();
    configureAnchors({ offset: -10 });
  }

  static contextType = UserContext;

  render() {
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
            response. If you have any questions, please <Link href="/contact">contact us</Link>.
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <BigSpacer/>

        <FlexCenter>
          <Styles.Button to="/philosophy">
            Read More
          </Styles.Button>
        </FlexCenter>

        <HugeSpacer/>
        <BigSpacer/>

        <div style={{display: "flex", justifyContent: "space-evenly", flexWrap: "wrap"}}>
          <Section
            id="sars-cov-2"
            title="SARS-CoV-2 (COVID-19)"
            abstract="We are incorporating SARS-CoV-2 genomes as soon as they are shared and providing analyses and situation reports.
            In addition we have developed a number of resources and tools, and are facilitating independent groups to run their own analyses."
            cards={nCoVCards}
            buttonText="See all resources"
            buttonLink="/sars-cov-2"
          />
          <Section
            id="groups"
            title="Nextstrain Groups"
            abstract="We want to enable research labs, public health entities and others to share their datasets and narratives through Nextstrain with complete control of their data and audience."
            cards={createGroupCards([{name: "neherlab"}, {name: "spheres"}])}
            buttonText="See all groups"
            buttonLink="/groups"
          />
          <Section
            id="pathogens"
            title="Explore pathogens"
            abstract="Genomic analyses of specific pathogens kept up-to-date by the Nextstrain team."
            cards={coreCards}
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
            cards={communityDatasets.data.filter((c) => c?.card?.frontpage).map((e) => e.card).slice(0, 2)}
            buttonText="Learn more"
            buttonLink="/community"
          />
          <Section
            id="narratives"
            title="Narratives"
            abstract="Narratives are a method of data-driven storytelling. They allow authoring of content which is displayed alongside a view into the data."
            cards={narrativeCards}
            buttonText="Find out more"
            buttonLink="https://docs.nextstrain.org/en/latest/guides/communicate/narratives-intro.html"
          />
        </div>

        <HugeSpacer/>

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
        <Footer splashImagesCredit/>

      </Styles.Container>
    );
  }
}

export default Splash;
