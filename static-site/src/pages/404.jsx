import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components";
// import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import Splash from "../components/splash";


const FourOhFour = () => {
  return (
    <div className="index-container">
      <Helmet title={config.siteTitle} />
      <main>
        <NavBar minified/>
        <div className="container">
          <ErrorContainer>
            {"Oops - that page doesn't exist! (404)."}
            <br/>
            {"Here's the splash page instead..."}
          </ErrorContainer>
        </div>
        <Splash />
      </main>
    </div>
  );
};

const ErrorContainer = styled.div`
  color: ${(props) => props.theme.errorRed};
  max-width: 640px;
  padding: 130px 0px 80px 0px;
  margin-top: 0px;
  margin-right: auto;
  margin-bottom: 0px;
  margin-left: auto;
  text-align: center;
  font-size: 28px;
  font-weight: 300;
  line-height: ${(props) => 1.4 * props.theme.niceLineHeight};
`;


export default FourOhFour;
