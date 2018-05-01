import React from "react";
import Helmet from "react-helmet";
import styled, {ThemeProvider} from "styled-components"
import config from "../../data/SiteConfig";
import {theme} from '../theme'

// Import global styles
import './prism-styles';
import "./globals.css";

export default class MainLayout extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <div>
        <Helmet>
          <title>{`${config.siteTitle}`}</title>
          <meta name="description" content={config.siteDescription} />
        </Helmet>
        <ThemeProvider theme={theme}>
          {children()}
        </ThemeProvider>
      </div>
    );
  }
}
