import React from "react";
import styled from "styled-components";
import * as Styles from "./splash/styles";

/* eslint-disable @typescript-eslint/no-var-requires */
const fredHutchLogo = require("../../static/logos/fred-hutch-logo-small.png");
const uniBasLogo = require("../../static/logos/unibas-logo.svg");
const nihLogo = require("../../static/logos/nih-logo.jpg");
const bmgfLogo = require("../../static/logos/bmgf.png");
const mapBoxLogo = require("../../static/logos/mapbox-logo-black.svg");
const sibLogo = require("../../static/logos/sib-logo.png");
const ospLogo = require("../../static/logos/osp-logo-small.png");
const bzLogo = require("../../static/logos/bz_logo.png");
/* eslint-enable @typescript-eslint/no-var-requires */

const AllLogosContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: 0px;
  padding: 10px 0px 0px 0px;
`;

const IndividualLogoContainer = styled.a`
  /* Using flex here (to vertically align the child img) causes aspect-ratio issues */
  flex-basis: 120px;
  margin: 10px auto 10px auto;
  text-align: center;
`;

const ImageContainer = styled.img`
  display: inline-block;
  width: ${(props) => props.width}px;
  max-width: ${(props) => props.width}px;
  vertical-align: middle;
  height: auto;
`;

const Logo = ({href, imgSrc, width=50}) => (
  <IndividualLogoContainer href={href} target="_blank" rel="noopener noreferrer">
    <span style={{display: "inline-block", height: "100%", verticalAlign: "middle"}} />
    <ImageContainer alt="logo" src={imgSrc} width={width} />
  </IndividualLogoContainer>
);

export const Logos = () => (
  <div className="row">
    <div className="col-lg-12">

      <Styles.FooterParagraph>
        Nextstrain is supported by
      </Styles.FooterParagraph>

      <AllLogosContainer>
        <Logo href="http://www.fredhutch.org/" imgSrc={fredHutchLogo.default.src} width={90}/>
        <Logo href="http://www.unibas.ch/" imgSrc={uniBasLogo.default.src} width={110}/>
        <Logo href="https://www.nih.gov/" imgSrc={nihLogo.default.src} width={60}/>
        <Logo href="https://www.gatesfoundation.org/" imgSrc={bmgfLogo.default.src} width={130}/>
        <Logo href="https://www.sib.swiss/" imgSrc={sibLogo.default.src} width={80}/>
        <Logo href="https://www.mapbox.com" imgSrc={mapBoxLogo.default.src} width={110}/>
        <Logo href="https://www.nih.gov/news-events/news-releases/open-science-prize-announces-epidemic-tracking-tool-grand-prize-winner" imgSrc={ospLogo.default.src} width={100}/>
        <Logo href="http://biozentrum.org/" imgSrc={bzLogo.default.src} width={115}/>
      </AllLogosContainer>
    </div>
  </div>
);
