import React from "react";
import Link from 'next/link'
import GenericPage from "../layouts/generic-page";
import { BigSpacer} from "../layouts/generalComponents";
import { H1, H2, FocusParagraph } from "../components/splash/styles";


const Philosophy = props => (
  <GenericPage location={props.location}>
      <H1>Philosophy</H1>

      <div className="row">
        <div className="col-md-6">
          <BigSpacer/>
          <H2>Pathogen Phylogenies</H2>
          <FocusParagraph>
            In the course of an infection and over an epidemic, pathogens naturally accumulate
            random mutations to their genomes. This is an inevitable consequence of error-prone
            genome replication. Since different genomes typically pick up different mutations,
            mutations can be used as a marker of transmission in which closely related genomes
            indicate closely related infections. By reconstructing a <i>phylogeny</i> we can learn
            about important epidemiological phenomena such as spatial spread, introduction timings
            and epidemic growth rate.
          </FocusParagraph>
        </div>
        <div className="col-md-6">
          <BigSpacer/>
          <H2>Actionable Inferences</H2>
          <FocusParagraph>
            However, if pathogen genome sequences are going to inform public health interventions,
            then analyses have to be rapidly conducted and results widely disseminated. Current
            scientific publishing practices hinder the rapid dissemination of epidemiologically
            relevant results. We thought an open online system that implements robust
            bioinformatic pipelines to synthesize data from across research groups has the best
            capacity to make epidemiologically actionable inferences.
          </FocusParagraph>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <BigSpacer/>
          <H2>This Website</H2>
          <FocusParagraph>
            This website aims to provide a <i>real-time</i> snapshot of evolving pathogen
            populations and to provide interactive data visualizations to virologists,
            epidemiologists, public health officials and citizen scientists. Through interactive
            data visualizations, we aim to allow exploration of continually up-to-date datasets,
            providing a novel surveillance tool to the scientific and public health communities.
          </FocusParagraph>
        </div>
        <div className="col-md-6">
          <BigSpacer/>
          <H2>Future Directions</H2>
          <FocusParagraph>
            Nextstrain is under active development and we have big plans for its future, including
            visualization, bioinformatics analysis and an increasing number and variety of
            datasets. If you have any questions or ideas, please <Link href="/contact">contact us</Link>.
          </FocusParagraph>
        </div>
      </div>

      <BigSpacer/>
  </GenericPage>
);

export default Philosophy;
