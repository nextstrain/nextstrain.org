import React from "react";
import Head from "next/head";
import styled from "styled-components";
// import SEO from "../components/SEO/SEO";
import { siteTitle } from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import Splash from "../components/splash";
import UserDataWrapper from "../layouts/userDataWrapper";
import MainLayout from "../components/layout";


const FourOhFour = () => {
  return (
      <MainLayout>
        <div className="index-container">
          <Head>
            <title>{siteTitle}</title>
          </Head>
          <main>
            <UserDataWrapper>
              <NavBar minified/>
              <div className="container">
                <ErrorContainer>
                  {"Oops - that page doesn't exist! (404)."}
                  <br/>
                  {"Here's the splash page instead..."}
                </ErrorContainer>
              </div>
              <Splash />
            </UserDataWrapper>
          </main>
        </div>
      </MainLayout>
    )
};

export const ErrorContainer = styled.div`
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
