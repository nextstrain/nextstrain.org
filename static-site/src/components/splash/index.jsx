import React from "react";
import ScrollableAnchor, { configureAnchors } from 'react-scrollable-anchor';
import {Link} from 'gatsby';
import { tweets } from "./tweets";
import Cards from "../Cards";
import nCoVCards from "../Cards/nCoVCards";
import coreCards from "../Cards/coreCards";
import communityCards from "../Cards/communityCards";
import narrativeCards from "../Cards/narrativeCards";
import Title from "./title";
import * as Styles from "./styles";
import { SmallSpacer, BigSpacer, HugeSpacer, FlexCenter } from "../../layouts/generalComponents";
import Footer from "../Footer";
import UserGroups from "./userGroups";

class Splash extends React.Component {
  constructor() {
    super();
    configureAnchors({ offset: -10 });
  }

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
            response. If you have any questions, or simply want to say hi, please give us a shout at
            hello<span style={{display: "none"}}>obfuscate</span>@nextstrain.org.
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <BigSpacer/>

        <FlexCenter>
          <Styles.Button to="#philosophy">
            Read More
          </Styles.Button>
        </FlexCenter>

        <HugeSpacer/>
        {this.props.user && <UserGroups user={this.props.user} visibleGroups={this.props.visibleGroups} />}

        <ScrollableAnchor id={'ncov'}>
          <Styles.H1>Novel coronavirus</Styles.H1>
        </ScrollableAnchor>

        <FlexCenter>
          <Styles.CenteredFocusParagraph>
            We are incorporating SARS-CoV-2 genomes as soon as they are shared and providing analyses and situation reports.
            Please see below for the latest analyses and situation reports.
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <Cards
          cards={nCoVCards}
        />

        <FlexCenter>
          <Styles.CenteredFocusParagraph>
            We have received a number of generous offers to contribute to the development of Nextstrain.
            Please <Link to="/docs/contributing/development">see here</Link> for how you may be able help!
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <HugeSpacer/>

        <ScrollableAnchor id={'pathogens'}>
          <Styles.H1>Explore pathogens</Styles.H1>
        </ScrollableAnchor>

        <FlexCenter>
          <Styles.CenteredFocusParagraph>
            Genomic analyses of specific pathogens kept up-to-date by the Nextstrain team
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <Cards
          cards={coreCards}
        />

        <HugeSpacer/>

        <ScrollableAnchor id={'community'}>
          <Styles.H1>From the community</Styles.H1>
        </ScrollableAnchor>

        <FlexCenter>
          <Styles.CenteredFocusParagraph>
            Analyses by independent groups <Link to="/docs/contributing/community-builds">stored and
            accessed via public GitHub repos</Link>
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <Cards
          cards={communityCards}
        />


        <HugeSpacer/>
        <ScrollableAnchor id={'narratives'}>
          <Styles.H1>Narratives</Styles.H1>
        </ScrollableAnchor>

        <FlexCenter>
          <Styles.CenteredFocusParagraph>
            Narratives are a method of data-driven storytelling. They allow authoring of content which is displayed alongside a view into the data.
            <a href="https://nextstrain.github.io/auspice/narratives/introduction"> See here to find out more.</a>
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <Cards cards={narrativeCards}/>

        <HugeSpacer/>
        <BigSpacer/>

        {/* <Styles.H1>Tutorials / Narrative links</Styles.H1> */}

        {/* SOCIAL MEDIA AKA TWITTER */}

        <Styles.H1>Mentions on Twitter</Styles.H1>
        <BigSpacer/>
        {tweets()}

        <HugeSpacer/>
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
              datasets. If you have any questions or ideas, please give us a shout at hello
              <span style={{display: "none"}}>obfuscate</span>
              @nextstrain.org.
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
          <Styles.Button to="docs">
            Read the documentation
          </Styles.Button>
        </FlexCenter>

        <Footer splashImagesCredit/>

      </Styles.Container>
    );
  }
}

export default Splash;
