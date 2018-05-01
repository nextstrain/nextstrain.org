import React from "react";
import styled from "styled-components"
// import TitleBar from "../components/framework/title-bar";
// import Title from "../components/framework/title";
import { generateLogos } from "./logos";
import { tweets } from "./tweets";
import { generateTiles } from "./cards";
import Title from "./title";
import {StyledDiv, H1, Container, Bigspacer, Flex} from "./styles"

// const nextstrainLogo = require("../../../static/logos/nextstrain-logo.png");
// const headerFont = "Lato, Helvetica Neue, Helvetica, sans-serif";
const medGrey = "#888";
const dataFont = "Lato, Helvetica Neue, Helvetica, sans-serif";

const materialButtonOutline = {
  border: "1px solid #CCC",
  backgroundColor: "inherit",
  borderRadius: 2,
  cursor: "pointer",
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: 10,
  paddingRight: 10,
  fontFamily: dataFont,
  color: medGrey,
  fontWeight: 400,
  textTransform: "uppercase",
  fontSize: 14,
  verticalAlign: "top"
};

const introText = {
  maxWidth: 600,
  marginTop: 0,
  marginRight: "auto",
  marginBottom: 20,
  marginLeft: "auto",
  textAlign: "center",
  fontSize: 16,
  fontWeight: 300,
  lineHeight: 1.42857143
}

// /* STYLED COMPONENTS */
// const CardMainText = styled.div`
//   font-family: ${headerFont};
//   font-weight: 500;
//   font-size: ${window.innerWidth > 1200 ? 28 : 20};
//   position: absolute;
//   padding-top: 10px;
//   padding-bottom: 10px;
//   padding-left: 20px;
//   padding-right: 20px;
//   top: 40px;
//   left: 20px;
//   color: white;
//   background: rgba(0, 0, 0, 0.7);
// `



class Splash extends React.Component {
  render() {
    return (
      <Container>
        <Flex>
          <Title />
        </Flex>
        <H1> Real-time tracking of virus evolution </H1>

        <p style={introText}>
          Nextstrain is an open-source project to harness the scientific and public health potential of pathogen genome data. We provide a continually-updated view of publicly available data with powerful analytics and visualizations showing pathogen evolution and epidemic spread. Our goal is to aid epidemiological understanding and improve outbreak response.
        </p>

        <Flex>
          <button style={materialButtonOutline} onClick={() => console.log("this.props.dispatch(changePage({path: /about})")}>
            Read More
          </button>
        </Flex>

        {/* THE CLICKABLE CARDS - see about page for sources & attribution */}

        <div className="bigspacer" />

        <div className="row">
          <H1>Explore viruses</H1>
          <div className="col-md-1" />
          <div className="col-md-10">
            {generateTiles(this.props)}
          </div>
          <div className="col-md-1" />
        </div>

        <H1>Tutorials / Narrative links</H1>


        {/* SOCIAL MEDIA AKA TWITTER */}
        <H1>From the community</H1>
        {tweets()}

        {/* FOOTER / LOGOS */}

        <Bigspacer />
        <div className="row">
          <div className="col-md-1" />
          <div className="col-md-10">
            <div className="line" />
            <Flex wrap="wrap" style={{marginTop: 20, justifyContent: "space-around"}}>
              {generateLogos}
            </Flex>
          </div>
          <div className="col-md-1" />
        </div>

      </Container>
    );
  }
}

export default Splash;
