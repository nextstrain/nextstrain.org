import React from "react";
import ScrollableAnchor from 'react-scrollable-anchor';
import { tweets } from "./tweets";
import { generateTiles } from "./cards";
import Title from "./title";
import * as Styles from "./styles";
import { SmallSpacer, MediumSpacer, BigSpacer, HugeSpacer,
  FlexCenter, FlexGrid, TeamMember } from "../../layouts/generalComponents";
import { Logos } from "../../components/logos";

class Splash extends React.Component {
  render() {
    return (
      <Styles.Container className="container">

        <BigSpacer />
        <FlexCenter>
          <Title />
        </FlexCenter>

        <HugeSpacer />
        <Styles.H1> Real-time tracking of virus evolution </Styles.H1>
        <SmallSpacer />

        <div className="row">
          <div className="col-md-2"/>
          <div className="col-md-8">
            <Styles.CenteredFocusParagraph>
              Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data with powerful analytics and visualizations showing pathogen evolution and epidemic spread. Our goal is to aid epidemiological understanding and improve outbreak response.
            </Styles.CenteredFocusParagraph>
          </div>
          <div className="col-md-2"/>
        </div>

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
            <Styles.H1>Explore viruses</Styles.H1>
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
        <BigSpacer/>
        <div className="row">
          <div className="col-md-6">
            <Styles.FocusParagraph>
              <Styles.H2>Viral Phylogenies</Styles.H2>
              <MediumSpacer />
              In the course of an infection and over an epidemic, viral pathogens naturally accumulate random mutations to their genomes. This is an inevitable consequence of error-prone viral replication. Since different viruses typically pick up different mutations, mutations can be used as a marker of transmission in which closely related viral genomes indicate closely related infections. By reconstructing a viral <i>phylogeny</i> we can learn about important epidemiological phenomena such as spatial spread, introduction timings and epidemic growth rate.
            </Styles.FocusParagraph>
          </div>
          <div className="col-md-6">
            <Styles.FocusParagraph>
              <Styles.H2>Actionable Inferences</Styles.H2>
              <MediumSpacer />
              However, if viral genome sequences are going to inform public health interventions, then analyses have to be rapidly conducted and results widely disseminated. Current scientific publishing practices hinder the rapid dissemination of epidemiologically relevant results. We thought an open online system that implements robust bioinformatic pipelines to synthesize data from across research groups has the best capacity to make epidemiologically actionable inferences.
            </Styles.FocusParagraph>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Styles.FocusParagraph>
              <Styles.H2>This Website</Styles.H2>
              <MediumSpacer />
              This website aims to provide a <i>real-time</i> snapshot of evolving viral populations and to provide interactive data visualizations to virologists, epidemiologists, public health officials and citizen scientists. Through interactive data visualizations, we aim to allow exploration of continually up-to-date datasets, providing a novel surveillance tool to the scientific and public health communities.
            </Styles.FocusParagraph>
          </div>
          <div className="col-md-6">
            <Styles.FocusParagraph>
              <Styles.H2>Future Directions</Styles.H2>
              <MediumSpacer />
              Nextstrain is under active development and we have big plans for its future, including visualization, bioinformatics analysis and an increasing number and variety of datasets. Please get in touch with <a href="https://twitter.com/hamesjadfield">@hamesjadfield</a>, <a href="https://twitter.com/richardneher">@richardneher</a> or <a href="https://twitter.com/trvrb">@trvrb</a> with any questions or comments.
            </Styles.FocusParagraph>
          </div>
        </div>

        <BigSpacer/>

        <div className="row">
          <div className="col-md-1"/>
          <div className="col-md-10">
            <Styles.IconParagraph>
              Nextstrain is built by <TeamMember name={"Trevor Bedford"} image={"trevor-bedford.jpg"} link={"http://bedford.io/team/trevor-bedford/"}/>, <TeamMember name={"Richard Neher"} image={"richard-neher.jpg"} link={"https://neherlab.org/richard-neher.html"}/>, <TeamMember name={"James Hadfield"} image={"james-hadfield.jpg"} link={"http://bedford.io/team/james-hadfield/"}/>, <TeamMember name={"Barney Potter"} image={"barney-potter.jpg"} link={"http://bedford.io/team/barney-potter/"}/>, <TeamMember name={"John Huddleston"} image={"john-huddleston.jpg"} link={"http://bedford.io/team/john-huddleston/"}/>, <TeamMember name={"Sidney Bell"} image={"sidney-bell.jpg"} link={"http://bedford.io/team/sidney-bell/"}/>, <TeamMember name={"Colin Megill"} image={"colin-megill.jpg"} link={"http://www.colinmegill.com/"}/>, <TeamMember name={"Emma Hodcroft"} image={"emma-hodcroft.jpg"} link={"http://emmahodcroft.com/"}/>, <TeamMember name={"Pavel Sagulenko"} image={"pavel-sagulenko.jpg"} link={"https://neherlab.org/pavel-sagulenko.html"}/> and <TeamMember name={"Charlton Callender"} image={"charlton-callender.jpg"} link={"http://bedford.io/team/charlton-callender/"}/>
            </Styles.IconParagraph>
          </div>
          <div className="col-md-1"/>
        </div>

        <BigSpacer/>

        <div className="row">
          <div className="col-md-12">
            <Styles.WideParagraph>
              <p>
                All <a href="https://github.com/nextstrain">source code</a> is freely available under the terms of the <a href="https://github.com/nextstrain/auspice/blob/master/LICENSE.txt">GNU Affero General Public License</a>. Screenshots etc may be used as long as a link to nextstrain.org is provided.
              </p>
              <p>
                This work is made possible by the open sharing of genetic data by research groups from all over the world. We gratefully acknowledge their contributions. Special thanks to Kristian Andersen, Allison Black, David Blazes, Peter Bogner, Matt Cotten, Ana Crisan, Gytis Dudas, Vivien Dugan, Karl Erlandson, Nuno Faria, Jennifer Gardy, Becky Garten, Dylan George, Ian Goodfellow, Nathan Grubaugh, Betz Halloran, Christian Happi, Jeff Joy, Paul Kellam, Philippe Lemey, Nick Loman, Sebastian Maurer-Stroh, Louise Moncla, Oliver Pybus, Andrew Rambaut, Colin Russell, Pardis Sabeti, Katherine Siddle, Kristof Theys, Dave Wentworth, Shirlee Wohl and Nathan Yozwiak for comments, suggestions and data sharing.
              </p>
            </Styles.WideParagraph>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Styles.FooterParagraph>
              Splash page images stylised in Lunapic. Zika drawing by David Goodwill, Dengue EM by Zhang et al, Ebola EM by Frederick Murphy / CDC, Influenza images by Cynthia Goldsmith / Thomas Rowe / CDC.
            </Styles.FooterParagraph>
          </div>
        </div>

        <BigSpacer/>

        {/* FOOTER / LOGOS */}
        <Logos />

        <SmallSpacer/>

        <div className="row">
          <div className="col-md-12">
            <Styles.FooterParagraph>
              © 2015-2018 Trevor Bedford and Richard Neher
            </Styles.FooterParagraph>
          </div>
        </div>

        <BigSpacer/>

      </Styles.Container>
    );
  }
}

export default Splash;
