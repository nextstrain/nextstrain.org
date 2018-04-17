import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components"
import SEO from "../components/SEO/SEO"
import Navigation from '../components/Header'
import config from "../../data/SiteConfig"
import Sidebar from "../components/Sidebar";
import {colors} from "../theme";
import {parseSlug} from "../utils/parseSlug"
const _ = require("lodash");

export default class AboutPage extends React.Component {
  render() {
    return (
      <div>
        <Helmet>
          <title>{`About Nextstrain`}</title>
        </Helmet>
        <SEO/>
        <HeaderContainer>
          <Navigation location={this.props.location} />
        </HeaderContainer>
        <BodyContainer>
          <div>
            <div className="row">
              <div className="col-md-1"/>
              <div className="col-md-7">
                <h1>About</h1>
                <h2>Viral Phylogenies</h2>
              </div>
            </div>

            <div className="row">

              <div className="col-md-1"/>
              <div className="col-md-6">

                In the course of an infection and over an epidemic, viral pathogens naturally accumulate random mutations to their genomes. This is an inevitable consequence of error-prone viral replication. Since different viruses typically pick up different mutations, mutations can be used as a marker of transmission in which closely related viral genomes indicate closely related infections. By reconstructing a viral "phylogeny" we can learn about important epidemiological phenomena such as spatial spread, introduction timings and epidemic growth rate.

                <h2>Actionable Inferences</h2>

                However, if viral genome sequences are going to inform public health interventions, then analyses have to be rapidly conducted and results widely disseminated. Current scientific publishing practices hinder the rapid dissemination of epidemiologically relevant results. We thought an open online system that implements robust bioinformatic pipelines to synthesize data from across research groups has the best capacity to make epidemiologically actionable inferences.

                <h2>This Website</h2>

                This website aims to provide a <i>real-time</i> snapshot of evolving viral populations and to provide interactive data visualizations to virologists, epidemiologists, public health officials and citizen scientists. Through interactive data visualizations, we aim to allow exploration of continually up-to-date datasets, providing a novel surveillance tool to the scientific and public health communities.

                <h2>Current Datasets</h2>

                <p/>Influenza Virus <a href="https://app.nextstrain.org/flu/h3n2/ha/3y">A/H3N2</a>, <a href="https://app.nextstrain.org/flu/h1n1pdm/ha/3y">A/H1N1pdm</a>, <a href="https://app.nextstrain.org/flu/vic/ha/3y">B/vic</a> and <a href="https://app.nextstrain.org/flu/yam/ha/3y">B/yam</a><p/>
                Datasets are shown together with antigen evolution, epitope mutations and clade frequency changes over the past 2-12 years.

                <p/><a href="https://app.nextstrain.org/ebola">Ebola Virus</a><p/>

                The 2013-2016 Ebola outbreak caused worldwide alarm and over 10,000 fatalities in West Africa. Nextstrain allows exploration of the phylogeny of over 1500 genomes, complete with temporal and geographic data and inferred transmission events. For a review into how genomic sequencing helped understand this outbreak see <a href="http://www.nature.com/nature/journal/v538/n7624/full/nature19790.html">Holmes <i>et al</i></a>

                <p/><a href="https://app.nextstrain.org/zika">Zika Virus</a><p/>

                The ongoing (2015-) epidemic of zika fever in the Americas is seen here in the context of over 400 genomes including isolates from Asia and the Pacific Islands. Multiple trans-Pacific and trans-Atlantic transmission events are easily seen, as well as the complex transmission routes between Brazil, Central America and the USA.

                <p/><a href="https://app.nextstrain.org/dengue">Dengue Virus</a><p/>

                Since the 1970s, dengue fever has rapidly expanded to become endemic to most tropical regions of the globe; today, approximately 40% of the total human population is at risk. There are four serotypes of dengue, DENV1-4. This rapid geographical expansion and genetic diversification is clearly seen here in the analysis of dengue genome sequences (curated by <a href="https://hfv.lanl.gov/components/sequence/HCV/search/searchi.html">LANL</a>). More information about dengue can be found at the <a href="http://www.who.int/denguecontrol/en/">WHO</a>.

                <p/><a href="https://app.nextstrain.org/avian/h7n9">Avian Influenza A/H7N9</a><p/>

                First detected in Humans in 2013, China is currently experiencing the fifth epidemic of avian influenza A(H7N9), which has a mortality rate of around 40%. The current epidemic is marked by a significant increase in cases compared to the past four winters, the reasons for which are unclear. Here, analysis of 1200 HA and NA genes (via <a href="http://platform.gisaid.org/">GISAID</a>) allows visualization of the inferred host jumps and geographic progression of this lineage over time. For more information see <a href="https://www.cdc.gov/mmwr/volumes/66/wr/mm6609e2.htm">Iuliano et al</a> and the <a href="https://www.cdc.gov/flu/avianflu/h7n9-virus.htm">CDC</a>.

                <h2>Future Directions</h2>
                Nextstrain is under active development and we have big plans for its future, including visualization, bioinformatics analysis and an increasing number and variety of datasets. Please get in touch with <a href="https://twitter.com/richardneher">@richardneher</a> or <a href="https://twitter.com/trvrb">@trvrb</a> with any questions or comments.

              </div>

              <div className="col-md-1"/>

              <div className="col-md-3 aside">

                Auspice version TO DO
                <p/>
                Concept by <a href="https://neherlab.org/richard-neher.html">Richard Neher</a> and <a href="http://bedford.io/team/trevor-bedford/">Trevor Bedford</a>.

                <p/>

                Built by <a href="https://neherlab.org/richard-neher.html">Richard Neher</a>, <a href="http://bedford.io/team/trevor-bedford/">Trevor Bedford</a>, <a href="http://bedford.io/team/james-hadfield/">James Hadfield</a>, <a href="http://www.colinmegill.com/">Colin Megill</a>, <a href="http://bedford.io/team/sidney-bell/">Sidney Bell</a>, <a href="http://bedford.io/team/john-huddleston/">John Huddleston</a>, <a href="http://bedford.io/team/barney-potter/">Barney Potter</a>, <a href="http://bedford.io/team/charlton-callender/">Charlton Callender</a> and <a href="https://neherlab.org/pavel-sagulenko.html">Pavel Sagulenko</a>.

                <p/>

                All <a href="http://github.com/nextstrain">source code</a> is freely available under the terms of the <a href="http://github.com/nextstrain/auspice/blob/master/LICENSE.txt">GNU Affero General Public License</a>. Screenshots etc may be used as long as a link to nextstrain.org is provided.

                <p/>

                This work is made possible by the open sharing of genetic data by research groups from all over the world. We gratefully acknowledge their contributions.

                <p/>

                Special thanks to Nick Loman, Kristian Andersen, Andrew Rambaut, Matt Cotten and Paul Kellam for comments, suggestions and data sharing.

                <p/>
                Splash page images stylised in <a href="http://www.lunapic.com/">Lunapic</a>. <a href="https://en.wikipedia.org/wiki/Zika_virus#/media/File:197-Zika_Virus-ZikaVirus.tif">Zika drawing</a> by David Goodwill, <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC156766/figure/cdg270f4/">Dengue EM</a> by Zhang et al, <a href="https://commons.wikimedia.org/wiki/Ebola#/media/File:Ebola_virus_em.png">Ebola EM</a> by Frederick Murphy / CDC, <a href="https://www.cdc.gov/media/subtopic/library/diseases.htm">Influenza images</a> by Cynthia Goldsmith / Thomas Rowe / CDC.

              </div>

              <div className="col-md-1"/>

            </div>

            <div className="row">
              <div className="col-md-1"/>
              <div className="col-md-10">
                <div className="line"/>
                <div wrap="wrap" style={{marginTop: 20, justifyContent: "space-around"}}>
                  <a key={1} href="http://www.fredhutch.org/" target="_blank">
                    <img width="75" src={require("../../static/logos/fred-hutch-logo-small.png")}/>
                  </a>,
                  <a key={2} href="http://www.eb.tuebingen.mpg.de/" target="_blank">
                    <img width="65" src={require("../../static/logos/max-planck-logo-small.png")}/>
                  </a>,
                  <a key={3} href="https://www.nih.gov/" target="_blank">
                    <img width="52" src={require("../../static/logos/nih-logo-small.png")}/>
                  </a>,
                  <a key={4} href="https://erc.europa.eu/" target="_blank">
                    <img width="60" src={require("../../static/logos/erc-logo-small.png")}/>
                  </a>,
                  <a key={5} href="https://www.openscienceprize.org/" target="_blank">
                    <img width="82" src={require("../../static/logos/osp-logo-small.png")}/>
                  </a>,
                  <a key={6} href="http://biozentrum.org/" target="_blank">
                    <img width="85" src={require("../../static/logos/bz_logo.png")}/>
                  </a>
                </div>
              </div>
              <div className="col-md-1"/>
            </div>
            <div className="bigspacer"/>
          </div>
        </BodyContainer>
      </div>
    );
  }
}

const BodyContainer = styled.div`
  overflow: scroll;
  justify-self: center;
  width: 100%;
  padding: ${props => props.theme.sitePadding};
  @media screen and (max-width: 600px) {
    order: 2;
  }

  & > div {
    max-width: ${props => props.theme.contentWidthLaptop};
    margin: auto;
  }

  & > h1 {
    color: ${props => props.theme.accentDark};
  }
`

const HeaderContainer = styled.div`
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  z-index: 2;
   @media screen and (max-width: 600px) {
    order: 1;
  }
`

const SidebarContainer = styled.div`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  background: ${props => props.theme.lightGrey};
  overflow: scroll;
   @media screen and (max-width: 600px) {
    order: 3;
    overflow: inherit;
  }
`

const AuthorDate = styled.div`
  font-size: 2em;
  font-weight: 100;
  color: ${colors.subtle};
`