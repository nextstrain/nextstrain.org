import React from "react";
import { generateLogos } from "./logos";
import { tweets } from "./tweets";
import { generateTiles } from "./cards";
import Title from "./title";
import * as Styles from "./styles"

class Splash extends React.Component {
  render() {
    return (
      <Styles.Container className="container">
        <Styles.Flex>
          <Title />
        </Styles.Flex>
        <Styles.H1> Real-time tracking of virus evolution </Styles.H1>

        <Styles.CenteredFocusParagraph>
          Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data with powerful analytics and visualizations showing pathogen evolution and epidemic spread. Our goal is to aid epidemiological understanding and improve outbreak response.
        </Styles.CenteredFocusParagraph>

        <Styles.Flex>
          <Styles.Button to="/about/">
            Read More
          </Styles.Button>
        </Styles.Flex>

        {/* THE CLICKABLE CARDS - see about page for sources & attribution */}
        <Styles.Bigspacer />

        <div className="row">
          <Styles.H1>Explore viruses</Styles.H1>
          <div className="col-md-1" />
          <div className="col-md-10">
            {generateTiles(this.props)}
          </div>
          <div className="col-md-1" />
        </div>

        <Styles.H1>Tutorials / Narrative links</Styles.H1>


        {/* SOCIAL MEDIA AKA TWITTER */}
        <Styles.H1>From the community</Styles.H1>
        {tweets()}

        {/* FOOTER / LOGOS */}

        <Styles.Bigspacer />
        <div className="row">
          <div className="col-md-1" />
          <div className="col-md-10">
            <div className="line" />
            <Styles.Flex wrap="wrap" style={{marginTop: 20, justifyContent: "space-around"}}>
              {generateLogos}
            </Styles.Flex>
          </div>
          <div className="col-md-1" />
        </div>

      </Styles.Container>
    );
  }
}

export default Splash;
