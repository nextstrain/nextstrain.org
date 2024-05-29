import React from "react";
import styled from "styled-components";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from 'next/link'
import Cards from "../Cards";
import showcaseCards from "../Cards/showcaseCards";
import Title from "./title";
import * as Styles from "./styles";
import { SmallSpacer, BigSpacer, HugeSpacer, FlexCenter, Line } from "../../layouts/generalComponents";
import Footer from "../Footer";
import { UserContext } from "../../layouts/userDataWrapper";


const HeadingIcon = styled.span`
  margin-left: 4px;
  font-size: 14px;
`

class Splash extends React.Component {

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

        <Styles.H1>Published resources</Styles.H1>

        <div id="showcase" style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100%"}}>
          <Styles.CenteredFocusParagraph style={{flexGrow: 1}}>
            These are published analyses from both the community and core Nextstrain team.
          </Styles.CenteredFocusParagraph>
          <div style={{display: "flex", justifyContent: "space-evenly", flexWrap: "wrap"}}>
            <Cards
              squashed
              cards={showcaseCards}
            />
          </div>
          <BigSpacer/>
        </div>

        <BigSpacer/>

        <Styles.H2>Sources</Styles.H2>

        <div className="row">
          <div className="col-md-4">
            <BigSpacer/>
            <Styles.H3><Link href="/pathogens">Nextstrain team</Link></Styles.H3>
            <Styles.FocusParagraph>
              Genomic analyses of specific pathogens kept up-to-date by the Nextstrain team.
            </Styles.FocusParagraph>
          </div>
          <div className="col-md-4">
            <BigSpacer/>
            <Styles.H3><Link href="/community">Community</Link></Styles.H3>
            <Styles.FocusParagraph>
              Analyses by independent groups <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html">stored and
              accessed via public GitHub repos</a>.
            </Styles.FocusParagraph>
          </div>
          <div className="col-md-4">
            <BigSpacer/>
            <Styles.H3><Link href="/groups">Groups</Link></Styles.H3>
            <Styles.FocusParagraph>
              {"We want to enable research labs, public health entities and others to share their datasets "}
              {"and narratives through Nextstrain with complete control of their data and audience."}
            </Styles.FocusParagraph>
          </div>
        </div>

        <BigSpacer/>
        <hr />
        <HugeSpacer/>

        <Styles.H1>Explore data in your web browser</Styles.H1>

        <BigSpacer/>

        <div className="row">
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>
              <Link href="https://clades.nextstrain.org" rel="noopener noreferrer" target="_blank">
                Nextclade <HeadingIcon><FaExternalLinkAlt/></HeadingIcon>
              </Link>
            </Styles.H2>
            <Styles.CenteredFocusParagraph>
              {"Nextclade allows you to analyze virus genome sequences in the web browser. "}
              {"It will align your sequence data to a reference genome, call mutations relative to "}
              {"that reference, and place your sequences on a phylogeny. "}
              {"It also reports clade assignments and quality of your sequence data."}
              <BigSpacer/>
              <img width="80%" alt="nextclade" src="https://docs.nextstrain.org/projects/nextclade/en/stable/_images/web_mut-tooltip.png" />
            </Styles.CenteredFocusParagraph>
          </div>
          <div className="col-md-6">
            <BigSpacer/>
            <Styles.H2>
              <Link href="https://auspice.us" rel="noopener noreferrer" target="_blank">
                Auspice.us <HeadingIcon><FaExternalLinkAlt/></HeadingIcon>
              </Link>
            </Styles.H2>
            <Styles.CenteredFocusParagraph>
              {"Auspice.us allows you to interactively explore phylogenomic datasets and "}
              {"narratives in the web browser."}
              <BigSpacer/>
              <img width="80%" alt="auspice.us" src="https://docs.nextstrain.org/en/latest/_images/mumps.png" />
            </Styles.CenteredFocusParagraph>
          </div>
        </div>

        <BigSpacer/>
        <hr />
        <HugeSpacer/>

        <Styles.H1>Analyze your data</Styles.H1>

        <BigSpacer/>

        <div className="row">
          <div className="col-md-4">
            <BigSpacer/>
            <Styles.H2>
              <Link href="https://docs.nextstrain.org/page/learn/parts.html" rel="noopener noreferrer" target="_blank">
                Getting started <HeadingIcon><FaExternalLinkAlt/></HeadingIcon>
              </Link>
            </Styles.H2>
            <Styles.CenteredFocusParagraph>
              {"Nextstrain is made up of many different parts that all work together. "}
              {"Learn the different parts and how to use them."}
              <BigSpacer/>
              <img width="80%" alt="getting-started" src={require(`../../../static/parts-of-a-whole.jpg`).default.src} />
            </Styles.CenteredFocusParagraph>
          </div>
          <div className="col-md-4">
            <BigSpacer/>
            <Styles.H2>
              <Link href="https://docs.nextstrain.org/page/tutorials/narratives-how-to-write.html" rel="noopener noreferrer" target="_blank">
                Write a narrative <HeadingIcon><FaExternalLinkAlt/></HeadingIcon>
              </Link>
            </Styles.H2>
            <Styles.CenteredFocusParagraph>
              {"Narratives are a method of data-driven storytelling. They allow authoring of content "}
              {"which is displayed alongside a view into the data."}
              <BigSpacer/>
              <img width="80%" alt="narrative" src={require(`../../../static/narrative.jpg`).default.src} />
            </Styles.CenteredFocusParagraph>
          </div>
          <div className="col-md-4">
            <BigSpacer/>
            <Styles.H2>
              <Link href="https://docs.nextstrain.org/en/latest/guides/share" rel="noopener noreferrer" target="_blank">
                Share <HeadingIcon><FaExternalLinkAlt/></HeadingIcon>
              </Link>
            </Styles.H2>
            <Styles.CenteredFocusParagraph>
              {"From the beginning, our motivations and philosophy for Nextstrain have focused on open, real-time, "}
              {"pre-publication sharing of results. Every situation is different and over time we've tried to "}
              {"develop a range of different approaches to take steps in this direction wherever possible."}
            </Styles.CenteredFocusParagraph>
          </div>
        </div>

        <HugeSpacer/>

        <Line style={{ margin: "30px 0px 10px 0px" }} />
        <Footer splashImagesCredit/>

      </Styles.Container>
    );
  }
}

export default Splash;
