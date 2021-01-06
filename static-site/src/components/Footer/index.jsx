/* eslint-disable react/prefer-stateless-function */

import React from "react";
import * as Styles from "../splash/styles";
import { SmallSpacer, BigSpacer, TeamMember, Line } from "../../layouts/generalComponents";
import { Logos } from "../../components/logos";

const SplashImagesCredit = () => (
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
        {` by Shmuel Rozenblatt, `}
        <a href="https://journals.plos.org/plospathogens/article?id=10.1371/journal.ppat.1003240#s5">Enterovirus</a>
        {` by Shingler `}<i>et al., </i>
        <a href="https://pixnio.com/science/microscopy-images/ralstonia-mannitolilytica-bacteria/gram-positive-mycobacterium-tuberculosis-bacteria-2">Tuberculosis</a>
        {` by Ray Butle, `}
        <a href="https://www.flickr.com/photos/nihgov/33288028956">RSV</a>
        {` by NIAID / NIH, `}
        {` Cassava Leaf by `}
        <a href="mailto:w.cuellar@cgiar.org">Wilmer Cuellar, </a>
        <a href="https://commons.wikimedia.org/wiki/File:Stripe_rust_on_wheat.jpg">Wheat yellow rust (Puccinia striiformis)</a>
        {` by Yue Jin / USDA, `}
        <a href="https://en.wikipedia.org/wiki/File:Coronaviruses_004_lores.jpg">coronavirus</a>
        {` by Dr. Fred Murphy / CDC.`}
      </Styles.FooterParagraph>
    </div>
  </div>
);

class Footer extends React.Component {

  render() {
    return (
      <div>
        <Line style={{margin: "30px 0px 10px 0px"}}/>

        <div className="row">
          <div className="col-md-1"/>
          <div className="col-md-10">
            <Styles.IconParagraph>
              {"Hadfield "}<i>{"et al., "}</i>
              <a href="https://doi.org/10.1093/bioinformatics/bty407" target="_blank" rel="noreferrer noopener">Nextstrain: real-time tracking of pathogen evolution</a>
              <i>, Bioinformatics</i> (2018)
              <div style={{margin: "10px 0px"}}/>
              Nextstrain is built by
              <div style={{margin: "0px 0px"}}/>
              <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
                <TeamMember name={"Trevor Bedford"} image={"trevor-bedford.jpg"} link={"http://bedford.io/team/trevor-bedford/"}/>,
                <TeamMember name={"Richard Neher"} image={"richard-neher.jpg"} link={"https://neherlab.org/richard-neher.html"}/>,
                <TeamMember name={"James Hadfield"} image={"james-hadfield.jpg"} link={"http://bedford.io/team/james-hadfield/"}/>,
                <TeamMember name={"Emma Hodcroft"} image={"emma-hodcroft.jpg"} link={"http://emmahodcroft.com/"}/>,
                <TeamMember name={"Thomas Sibley"} image={"thomas-sibley.jpg"} link={"https://bedford.io/team/thomas-sibley/"}/>,
                <TeamMember name={"John Huddleston"} image={"john-huddleston.jpg"} link={"http://bedford.io/team/john-huddleston/"}/>,
                <TeamMember name={"Ivan Aksamentov"} image={"ivan-aksamentov.jpg"} link={"https://neherlab.org/ivan-aksamentov.html"}/>,
                <TeamMember name={"Jover Lee"} image={"jover-lee.jpg"} link={"http://bedford.io/team/jover-lee/"}/>,
                <TeamMember name={"Kairsten Fay"} image={"kairsten-fay.jpg"} link={"http://bedford.io/team/kairsten-fay/"}/>,
                <TeamMember name={"Moira Zuber"} image={"moira-zuber.jpg"}/>,
                <TeamMember name={"Eli Harkins"} image={"eli-harkins.jpg"} link={"https://bedford.io/team/eli-harkins/"}/>,
                <TeamMember name={"Misja Ilcisin"} image={"misja-ilcisin.jpg"} link={"http://bedford.io/team/misja-ilcisin/"}/>,
                <TeamMember name={"Cassia Wagner"} image={"cassia-wagner.jpg"} link={"https://bedford.io/team/cassia-wagner/"}/>,
                <TeamMember name={"Louise Moncla"} image={"louise-moncla.jpg"} link={"http://bedford.io/team/louise-moncla/"}/>,
                <TeamMember name={"Allison Black"} image={"allison-black.jpg"} link={"http://bedford.io/team/allison-black/"}/>,
                <TeamMember name={"Sidney Bell"} image={"sidney-bell.jpg"} link={"http://bedford.io/team/sidney-bell/"}/>,
                <TeamMember name={"Miguel Parades"} image={"miguel-parades.jpg"} link={"https://bedford.io/team/miguel-parades/"}/>,
                <TeamMember name={"Colin Megill"} image={"colin-megill.jpg"} link={"http://www.colinmegill.com/"}/>,
                <TeamMember name={"Barney Potter"} image={"barney-potter.jpg"} link={"http://bedford.io/team/barney-potter/"}/>,
                <TeamMember name={"Pavel Sagulenko"} image={"pavel-sagulenko.jpg"} link={"https://neherlab.org/pavel-sagulenko.html"}/>,
                <TeamMember name={"Charlton Callender"} image={"charlton-callender.jpg"} link={"http://bedford.io/team/charlton-callender/"}/>
              </div>
            </Styles.IconParagraph>
          </div>
          <div className="col-md-1"/>
        </div>

        <BigSpacer/>

        <div className="row">
          <div className="col-md-12">
            <Styles.WideParagraph>
              All <a href="https://github.com/nextstrain">source code</a> is freely available under the terms of the <a href="https://github.com/nextstrain/auspice/blob/master/LICENSE.txt">GNU Affero General Public License</a>. Screenshots may be used under a <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY-4.0 license</a> and attribution to nextstrain.org must be provided.
            </Styles.WideParagraph>

            <Styles.WideParagraph>
              This work is made possible by the open sharing of genetic data by
              research groups from all over the world. We gratefully acknowledge
              their contributions. Special thanks to Kristian Andersen, Josh
              Batson, David Blazes, Jesse Bloom, Peter Bogner, Anderson Brito,
              Matt Cotten, Ana Crisan, Tulio de Oliveira, Gytis Dudas, Vivien
              Dugan, Karl Erlandson, Nuno Faria, Jennifer Gardy, Nate Grubaugh,
              Becky Kondor, Dylan George, Ian Goodfellow, Betz Halloran,
              Christian Happi, Jeff Joy, Paul Kellam, Philippe Lemey, Nick
              Loman, Duncan MacCannell, Erick Matsen, Sebastian Maurer-Stroh,
              Placide Mbala, Danny Park, Oliver Pybus, Andrew Rambaut, Colin
              Russell, Pardis Sabeti, Katherine Siddle, Kristof Theys, Dave
              Wentworth, Shirlee Wohl and Cecile Viboud for comments,
              suggestions and data sharing.
            </Styles.WideParagraph>
          </div>
        </div>

        {this.props.splashImagesCredit ? <SplashImagesCredit/> : null}

        <BigSpacer/>

        {/* FOOTER / LOGOS */}
        <Logos />

        <SmallSpacer/>

        <div className="row">
          <div className="col-md-12">
            <Styles.FooterParagraph>
              © 2015-2021 Trevor Bedford and Richard Neher
            </Styles.FooterParagraph>
          </div>
        </div>

        <BigSpacer/>
      </div>
    );
  }
}

export default Footer;
