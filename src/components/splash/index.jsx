import React from "react";
import { tweets } from "./tweets";
import { generateTiles } from "./cards";
import Title from "./title";
import * as Styles from "./styles";
import {SmallSpacer, MediumSpacer, BigSpacer, HugeSpacer, Flex} from "../../layouts/generalComponents";
import {Logos} from "../../components/logos";

class Splash extends React.Component {
  render() {
    return (
      <Styles.Container className="container">
        <BigSpacer />
        <Flex>
          <Title />
        </Flex>
        <HugeSpacer />
        <Styles.H1> Real-time tracking of virus evolution </Styles.H1>
        <SmallSpacer />
        <Flex>
          <Styles.CenteredFocusParagraph>
            Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data with powerful analytics and visualizations showing pathogen evolution and epidemic spread. Our goal is to aid epidemiological understanding and improve outbreak response.
          </Styles.CenteredFocusParagraph>
        </Flex>
        <SmallSpacer />
        <Flex>
          <Styles.Button to="/about/">
            Read More
          </Styles.Button>
        </Flex>

        {/* THE CLICKABLE CARDS - see about page for sources & attribution */}
        <BigSpacer />
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
        <HugeSpacer />
        <Styles.H1>From the community</Styles.H1>
        <BigSpacer />
        {tweets()}

        {/* FOOTER / LOGOS */}
        <Logos />

      </Styles.Container>
    );
  }
}

export default Splash;
