import React from "react";

import Logos from "../logos";
import { BigSpacer, SmallSpacer } from "../spacers";

import SiteMap from "./site-map";
import TeamList from "./team-list";

/**
 * A React Server Component that renders the site footer, used at the
 * bottom of all our pages.
 */
export default function Footer(): React.ReactElement {
  return (
    <div>
      <SiteMap />

      <BigSpacer />
      <div className="row">
        <div className="col-lg-1" />

        <div className="col-lg-10">
          <div className="iconParagraph">
            {"Hadfield "}
            <i>{"et al., "}</i>
            <a
              href="https://doi.org/10.1093/bioinformatics/bty407"
              target="_blank"
              rel="noreferrer noopener"
            >
              Nextstrain: real-time tracking of pathogen evolution
            </a>
            <i>, Bioinformatics</i> (2018)

            <TeamList />

          </div>
        </div>

        <div className="col-lg-1" />
      </div>

      <BigSpacer />
      <div className="row">
        <div className="col-lg-12">
          <p className="wideParagraph">
            All <a href="https://github.com/nextstrain">source code</a> is
            freely available under the terms of the{" "}
            <a href="https://github.com/nextstrain/auspice/blob/master/LICENSE.txt">
              GNU Affero General Public License
            </a>
            . Screenshots may be used under a{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/">
              CC-BY-4.0 license
            </a>{" "}
            and attribution to nextstrain.org must be provided.
          </p>
          <p className="wideParagraph">
            This work is made possible by the open sharing of genetic data by
            research groups from all over the world. We gratefully acknowledge
            their contributions. Special thanks to Kristian Andersen, Josh
            Batson, David Blazes, Jesse Bloom, Peter Bogner, Anderson Brito,
            Matt Cotten, Ana Crisan, Tulio de Oliveira, Gytis Dudas, Vivien
            Dugan, Karl Erlandson, Nuno Faria, Jennifer Gardy, Nate Grubaugh,
            Becky Kondor, Dylan George, Ian Goodfellow, Betz Halloran, Christian
            Happi, Jeff Joy, Paul Kellam, Philippe Lemey, Nick Loman, Duncan
            MacCannell, Erick Matsen, Sebastian Maurer-Stroh, Placide Mbala,
            Danny Park, Oliver Pybus, Andrew Rambaut, Colin Russell, Pardis
            Sabeti, Katherine Siddle, Kristof Theys, Dave Wentworth, Shirlee
            Wohl and Cecile Viboud for comments, suggestions and data sharing.
          </p>
        </div>
      </div>

      <SmallSpacer />

      {/* FOOTER / LOGOS */}
      <Logos />

      <SmallSpacer />

      <div className="row">
        <div className="col-lg-12">
          <p className="footerParagraph copyright">© Trevor Bedford and Richard Neher</p>
        </div>
      </div>
    </div>
  );
}
