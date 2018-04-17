import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components"
import SEO from "../components/SEO/SEO"
import Navigation from '../components/Header'
import config from "../../data/SiteConfig"
import Sidebar from "../components/Sidebar";
import {colors} from "../theme";
import {parseSlug} from "../utils/parseSlug"
const _ = require("lodash");

export default class AboutTemplate extends React.Component {
  render() {
    console.log("AboutTemplate")
    // const { slug } = this.props.pathContext;
    // const postNode = this.props.data.postBySlug;
    // const post = postNode.frontmatter;
    // const contentsType = this.props.data.postBySlug.frontmatter.type;
    
    return (
      <div>
        <Helmet>
          <title>{`About Nextstrain`}</title>
        </Helmet>
        <SEO/>
        <HeaderContainer>
          <Navigation location={this.props.location} />
        </HeaderContainer>
        <BodyContainer>
          <div>
            A B O U T
          </div>
        </BodyContainer>
      </div>
    );
  }
}

const BodyContainer = styled.div`
  overflow: scroll;
  justify-self: center;
  width: 100%;
  padding: ${props => props.theme.sitePadding};
  @media screen and (max-width: 600px) {
    order: 2;
  }

  & > div {
    max-width: ${props => props.theme.contentWidthLaptop};
    margin: auto;
  }

  & > h1 {
    color: ${props => props.theme.accentDark};
  }
`

const HeaderContainer = styled.div`
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  z-index: 2;
   @media screen and (max-width: 600px) {
    order: 1;
  }
`

const SidebarContainer = styled.div`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  background: ${props => props.theme.lightGrey};
  overflow: scroll;
   @media screen and (max-width: 600px) {
    order: 3;
    overflow: inherit;
  }
`

const AuthorDate = styled.div`
  font-size: 2em;
  font-weight: 100;
  color: ${colors.subtle};
`