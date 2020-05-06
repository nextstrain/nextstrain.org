/* eslint global-require:"off" */
import React from "react";
import styled from "styled-components";
import {Line} from "../layouts/generalComponents";

const fredHutchLogo = require("../../static/logos/fred-hutch-logo-small.png");
const maxPlanckLogo = require("../../static/logos/max-planck-logo.png");
const nihLogo = require("../../static/logos/nih-logo.jpg");
const mapBoxLogo = require("../../static/logos/mapbox-logo-black.svg");
const ercLogo = require("../../static/logos/erc-logo.jpg");
const ospLogo = require("../../static/logos/osp-logo-small.png");
const bzLogo = require("../../static/logos/bz_logo.png");

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
    <Line style={{marginBottom: 0}}/>
    <div className="col-md-12">
      <AllLogosContainer>
        <Logo href="http://www.fredhutch.org/" imgSrc={fredHutchLogo} width={90}/>
        <Logo href="http://www.eb.tuebingen.mpg.de/" imgSrc={maxPlanckLogo} width={90}/>
        <Logo href="https://www.nih.gov/" imgSrc={nihLogo} width={65}/>
        <Logo href="https://www.mapbox.com" imgSrc={mapBoxLogo} width={135}/>
        <Logo href="https://erc.europa.eu/" imgSrc={ercLogo} width={70}/>
        <Logo href="https://www.openscienceprize.org/" imgSrc={ospLogo} width={110}/>
        <Logo href="http://biozentrum.org/" imgSrc={bzLogo} width={120}/>
      </AllLogosContainer>
    </div>
  </div>
);
