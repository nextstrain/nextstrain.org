import React from "react";
import ScrollableAnchor from 'react-scrollable-anchor';
import { tweets } from "./tweets";
import { generateTiles } from "./cards";
import Title from "./title";
import * as Styles from "./styles";
import { SmallSpacer, MediumSpacer, BigSpacer, HugeSpacer,
  FlexCenter, TeamMember, Line } from "../../layouts/generalComponents";
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

        <FlexCenter>
          <Styles.CenteredFocusParagraph>
            Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data with powerful analytics and visualizations showing pathogen evolution and epidemic spread. Our goal is to aid epidemiological understanding and improve outbreak response.
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
        <div className="row">
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>Viral Phylogenies</Styles.H2>
            <Styles.FocusParagraph>
              In the course of an infection and over an epidemic, viral pathogens naturally accumulate random mutations to their genomes. This is an inevitable consequence of error-prone viral replication. Since different viruses typically pick up different mutations, mutations can be used as a marker of transmission in which closely related viral genomes indicate closely related infections. By reconstructing a viral <i>phylogeny</i> we can learn about important epidemiological phenomena such as spatial spread, introduction timings and epidemic growth rate.
            </Styles.FocusParagraph>
          </div>
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>Actionable Inferences</Styles.H2>
            <Styles.FocusParagraph>
              However, if viral genome sequences are going to inform public health interventions, then analyses have to be rapidly conducted and results widely disseminated. Current scientific publishing practices hinder the rapid dissemination of epidemiologically relevant results. We thought an open online system that implements robust bioinformatic pipelines to synthesize data from across research groups has the best capacity to make epidemiologically actionable inferences.
            </Styles.FocusParagraph>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>This Website</Styles.H2>
            <Styles.FocusParagraph>
              This website aims to provide a <i>real-time</i> snapshot of evolving viral populations and to provide interactive data visualizations to virologists, epidemiologists, public health officials and citizen scientists. Through interactive data visualizations, we aim to allow exploration of continually up-to-date datasets, providing a novel surveillance tool to the scientific and public health communities.
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

        <Line style={{margin: "30px 0px 10px 0px"}}/>

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
              All <a href="https://github.com/nextstrain">source code</a> is freely available under the terms of the <a href="https://github.com/nextstrain/auspice/blob/master/LICENSE.txt">GNU Affero General Public License</a>. Screenshots etc may be used as long as a link to nextstrain.org is provided.
            </Styles.WideParagraph>

            <Styles.WideParagraph>
              This work is made possible by the open sharing of genetic data by research groups from all over the world. We gratefully acknowledge their contributions. Special thanks to Kristian Andersen, Allison Black, David Blazes, Peter Bogner, Matt Cotten, Ana Crisan, Gytis Dudas, Vivien Dugan, Karl Erlandson, Nuno Faria, Jennifer Gardy, Becky Garten, Dylan George, Ian Goodfellow, Nathan Grubaugh, Betz Halloran, Christian Happi, Jeff Joy, Paul Kellam, Philippe Lemey, Nick Loman, Sebastian Maurer-Stroh, Louise Moncla, Oliver Pybus, Andrew Rambaut, Colin Russell, Pardis Sabeti, Katherine Siddle, Kristof Theys, Dave Wentworth, Shirlee Wohl and Nathan Yozwiak for comments, suggestions and data sharing.
            </Styles.WideParagraph>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Styles.FooterParagraph>
              {`Splash page images stylised in `}
              <a href="http://www.lunapic.com/">Lunapic</a>
              {`. `}
              <a href="https://en.wikipedia.org/wiki/Zika_virus#/media/File:197-Zika_Virus-ZikaVirus.tif">Zika drawing</a>
              {` by David Goodwill, `}
              <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC156766/figure/cdg270f4/">Dengue EM</a>
              {` by Zhang `}<i>et al., </i>
              <a href="https://commons.wikimedia.org/wiki/Ebola#/media/File:Ebola_virus_em.png">Ebola EM</a>
              {` by Frederick Murphy / CDC, `}
              <a href="https://commons.wikimedia.org/wiki/File:Influenza_virus_particle_color.jpg">Seasonal Influenza</a>
              {`, `}
              <a href="https://commons.wikimedia.org/wiki/File:Lassa_virus.JPG">Lassa</a>
              {` and `}
              <a href="https://phil.cdc.gov/Details.aspx?pid=10701">West Nile Virus</a>
              {` images by Cynthia Goldsmith / CDC, `}
              <a href="https://phil.cdc.gov/details.aspx?pid=15670">Avian Influenza (A/H7N9)</a>
              {` by Cynthia Goldsmith and Thomas Rowe / CDC, `}
              <a href="https://phil.cdc.gov/Details.aspx?pid=1874">Mumps</a>
              {` by the CDC, `}
              <a href="http://www.tau.ac.il/lifesci/departments/biotech/members/rozenblatt/fig3.html">Measles</a>
              {` by Shmuel Rozenblatt.`}
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
