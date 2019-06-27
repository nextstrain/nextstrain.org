import React from "react";
import ScrollableAnchor, { configureAnchors } from 'react-scrollable-anchor';
import { tweets } from "./tweets";
import { generateTiles } from "./cards";
import Title from "./title";
import * as Styles from "./styles";
import { SmallSpacer, MediumSpacer, BigSpacer, HugeSpacer,FlexCenter, Line } from "../../layouts/generalComponents";
import Footer from "../Footer";

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
            Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data alongside powerful analytic and visualization tools for use by the community. Our goal is to aid epidemiological understanding and improve outbreak response. If you have any questions, or simply want to say hi, please give us a shout at hello<span style={{display: "none"}}>obfuscate</span>@nextstrain.org.
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <BigSpacer/>

        <FlexCenter>
          <Styles.Button to="#philosophy">
            Read More
          </Styles.Button>
        </FlexCenter>


        {/* THE CLICKABLE CARDS - see about page for sources & attribution */}
        <HugeSpacer />
        <div className="row">
          <div className="col-md-1" />
          <div className="col-md-10">
            <Styles.H1>Explore pathogens</Styles.H1>
            <MediumSpacer />
            {generateTiles()}
          </div>
          <div className="col-md-1" />
        </div>

        {/* <Styles.H1>Tutorials / Narrative links</Styles.H1> */}

        {/* SOCIAL MEDIA AKA TWITTER */}
        <HugeSpacer/>
        <Styles.H1>From the community</Styles.H1>
        <HugeSpacer/>
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
              In the course of an infection and over an epidemic, pathogens naturally accumulate random mutations to their genomes. This is an inevitable consequence of error-prone genome replication. Since different genomes typically pick up different mutations, mutations can be used as a marker of transmission in which closely related genomes indicate closely related infections. By reconstructing a <i>phylogeny</i> we can learn about important epidemiological phenomena such as spatial spread, introduction timings and epidemic growth rate.
            </Styles.FocusParagraph>
          </div>
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>Actionable Inferences</Styles.H2>
            <Styles.FocusParagraph>
              However, if pathogen genome sequences are going to inform public health interventions, then analyses have to be rapidly conducted and results widely disseminated. Current scientific publishing practices hinder the rapid dissemination of epidemiologically relevant results. We thought an open online system that implements robust bioinformatic pipelines to synthesize data from across research groups has the best capacity to make epidemiologically actionable inferences.
            </Styles.FocusParagraph>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>This Website</Styles.H2>
            <Styles.FocusParagraph>
              This website aims to provide a <i>real-time</i> snapshot of evolving pathogen populations and to provide interactive data visualizations to virologists, epidemiologists, public health officials and citizen scientists. Through interactive data visualizations, we aim to allow exploration of continually up-to-date datasets, providing a novel surveillance tool to the scientific and public health communities.
            </Styles.FocusParagraph>
          </div>
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>Future Directions</Styles.H2>
            <Styles.FocusParagraph>
              Nextstrain is under active development and we have big plans for its future, including visualization, bioinformatics analysis and an increasing number and variety of datasets. If you have any questions or ideas, please give us a shout at hello<span style={{display: "none"}}>obfuscate</span>@nextstrain.org.
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
            Nextstrain provides an open-source toolkit enabling the bioinformatics and visualization you see on this site.
            Tweak our analyses and create your own using the same tools we do.
            We aim to empower the wider genomic epidemiology and public health communities.
          </Styles.CenteredFocusParagraph>
        </FlexCenter>

        <BigSpacer/>

        <FlexCenter>
          <Styles.Button to="docs">
            Read the documentation
          </Styles.Button>
        </FlexCenter>

        <Footer splashImagesCredit={true}/>

      </Styles.Container>
    );
  }
}

export default Splash;
