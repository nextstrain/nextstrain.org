import React from "react";
import * as Styles from "../splash/styles";
import { SmallSpacer, BigSpacer } from "../../layouts/generalComponents";
import { Logos } from "../../components/logos";
import { FooterList } from "../People/avatars";
import { SiteMap } from "./sitemap";

class Footer extends React.Component {
  render() {
    return (
      <div>
        <SiteMap />

        <BigSpacer />

        <div className="row">
          <div className="col-md-1"/>
          <div className="col-md-10">
            <Styles.IconParagraph>
              {"Hadfield "}<i>{"et al., "}</i>
              <a href="https://doi.org/10.1093/bioinformatics/bty407" target="_blank" rel="noreferrer noopener">Nextstrain: real-time tracking of pathogen evolution</a>
              <i>, Bioinformatics</i> (2018)
              {(typeof window !== 'undefined' && window.location.pathname.replace(/\//g, "")!=="team") && (
                <>
                  <div style={{margin: "10px 0px"}}/>
                  The core Nextstrain team is
                  <div style={{margin: "0px 0px"}}/>
                  <FooterList />
                  {"Please see the "}
                  <a href="/team">team page</a>
                  {" for more details."}
                </>
                )}
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

        <SmallSpacer/>

        {/* FOOTER / LOGOS */}
        <Logos />

        <SmallSpacer/>

        <div className="row">
          <div className="col-md-12">
            <Styles.FooterParagraph>
              © 2015–2023 Trevor Bedford and Richard Neher
            </Styles.FooterParagraph>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;
