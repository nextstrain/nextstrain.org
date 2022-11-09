import React from "react";
import Helmet from "react-helmet";
import styled, {ThemeProvider} from "styled-components";
import config from "../../data/SiteConfig";
import {theme} from '../layouts/theme';

/**
 * This file was designed for Gatsby v1 and was located at `src/layouts/index.jsx`
 * Gatsby v2 removed this "top level component". I've followed the migration path outlined in
 * https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/#remove-or-refactor-layout-components
 * however in theory this could be removed completely.
 */

// Import global stylesheets
import '../styles/prism.css';
import "../styles/browserCompatability.css";
import "../styles/bootstrap.css";
import "../styles/globals.css";

// eslint-disable-next-line react/prefer-stateless-function
export default class MainLayout extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <div>
        <Helmet>
          <title>{`${config.siteTitle}`}</title>
          <meta name="description" content={config.siteDescription} />
          <link rel="me" href="https://mstdn.science/@nextstrain" />
        </Helmet>
        <ThemeProvider theme={theme}>
          <GlobalStyles>
            {children}
          </GlobalStyles>
        </ThemeProvider>
      </div>
    );
  }
}

const GlobalStyles = styled.div`\

  a {
    text-decoration: none;
    background-color: transparent;
    color: ${(props) => props.theme.blue};
    font-weight: 500;
  }
  a:active,
  a:hover {
    outline: 0;
  }
  a:hover,
  a:focus {
    color: #5097BA;
    text-decoration: underline;
  }
  a:focus {
    outline: 5px auto -webkit-focus-ring-color;
    outline-offset: -2px;
  }

  h1 {font-size: 3.5rem; font-weight: 500;}
  h2 {font-size: 2.5rem; font-weight: 500;}
  h3 {font-size: 2rem; font-weight: 500;}
  h4 {font-size: 1.8rem; font-weight: 500;}
  h5 {font-size: 1.6rem; font-weight: 500;}
  h6 {font-size: 1.6rem; font-weight: 300;}

  h1, h2, h3, h4, h5, h6, p, ul, ol, dl {
      margin: 20px 0px 0px 0px;
  }

  table {
      border-collapse: collapse;
  }
  table, th, td {
      border: 1px solid black;
      padding: 5px;
  }

`;
