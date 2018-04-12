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

export default class GenericTemplate extends React.Component {
  render() {
    // console.log("genericTemplate props:", this.props)
    const { slug } = this.props.pathContext;
    const postNode = this.props.data.postBySlug;
    const post = postNode.frontmatter;
    const contentsType = this.props.data.postBySlug.frontmatter.type;
    
    const selectedSlug = parseSlug(slug);
    const allSlugs = this.props.data.allSlugs.edges
      .map((e) => parseSlug(e.node.fields.slug))
      .filter((d) => d.category === selectedSlug.category)
    
    return (
      <div>
        <Helmet>
          <title>{`${_.startCase(selectedSlug.title)} | ${config.siteTitle}`}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <BodyGrid>
          <HeaderContainer>
            <Navigation location={this.props.location} />
          </HeaderContainer>
          <SidebarContainer>
            <Sidebar
              selectedSlug={selectedSlug}
              allSlugs={allSlugs}
            />
          </SidebarContainer>
          <BodyContainer>
            <div>
              <h1>
                {_.startCase(selectedSlug.title)}
              </h1>
              <AuthorDate>
                {post.author}  {post.date}
              </AuthorDate>
              <div dangerouslySetInnerHTML={{ __html: postNode.html }} />
            </div>
          </BodyContainer>
        </BodyGrid>
      </div>
    );
  }
}

const BodyGrid = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: 75px 1fr;
  grid-template-columns: 300px 1fr;

  @media screen and (max-width: 600px) {
    display: flex;
    flex-direction: column;
    height: inherit;
  }
`

const BodyContainer = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
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

/* eslint no-undef: "off"*/
export const pageQuery = graphql`
  query genericTemplate($slug: String!) {
    allSlugs: allMarkdownRemark {
      edges {
        node {
          fields {
            slug
          }
        }
      }
    }
    postBySlug: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      excerpt
      frontmatter {
        author
        date
      }
      fields {
        slug
      }
    }
  }
`;
