import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components";
import SEO from "../components/SEO/SEO";
import NavBar from '../components/nav-bar';
import Sidebar from "../components/Sidebar";
import { CenteredContainer, MarkdownContent } from "../layouts/generalComponents";

const parseSlug = require("../util/parseSlug");

export default class GenericTemplate extends React.Component {
  render() {
    // console.log("genericTemplate props:", this.props)
    const { slug } = this.props.pathContext; /* defined by createPages */
    const postNode = this.props.data.postBySlug;
    const post = postNode.frontmatter;
    const showAuthor = ["blog", "reports"].indexOf(parseSlug.parseSlug(slug).section) !== -1;
    return (
      <div>
        <Helmet>
          <title>{post.title}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <SidebarBodyFlexContainer className="container">
          <SidebarContainer>
            <NavBar minified location={this.props.location} />
            <Sidebar
              selectedSlug={slug}
              allNodes={this.props.data.allSlugs.edges}
            />
          </SidebarContainer>
          <ContentContainer>
            <CenteredContainer>
              <MarkdownContent>
                <PostAuthorSurrounds>
                  {showAuthor ? (
                    <div>
                      <PostAuthor>{post.author}</PostAuthor>
                      <PostDate>{post.date}</PostDate>
                    </div>
                  ) : (
                    <PostDate>Last modified {post.date}</PostDate>
                  )}
                </PostAuthorSurrounds>
                <PostTitle>{post.title}</PostTitle>
                <MarkdownContent dangerouslySetInnerHTML={{ __html: postNode.html }} />
              </MarkdownContent>
            </CenteredContainer>
          </ContentContainer>
        </SidebarBodyFlexContainer>
      </div>
    );
  }
}

const SidebarBodyFlexContainer = styled.div`
  height: calc(100vh);
  overflow: hidden;  /*makes the body non-scrollable (we will add scrolling to the sidebar and main content containers)*/
  display: flex;  /*enables flex content for its children*/
  flex-direction: row;
  width: 100% !important;
`;

const SidebarContainer = styled.div`
  flex-grow: 1;  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: scroll;  /*adds scroll to this container*/
  width: 260px;
  min-width: 266px;
  max-width: 266px;
  background-color: #F2F2F2;
  box-shadow: -3px 0px 3px -3px rgba(0, 0, 0, 0.2) inset;
`;

const ContentContainer = styled.div`
  padding-top: 15px;
  padding-bottom: 25px;
  padding-left: 25px;
  padding-right: 25px;
  flex-grow: 1;  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: scroll;  /*adds scroll to this container*/
`;

const PostTitle = styled.h1`
  color: ${(props) => props.theme.darkGrey};
  font-weight: 500 !important;
  font-size: 38px !important;
`;
const PostAuthorSurrounds = styled.div`
  min-height: 2rem;
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 100;
  color: ${(props) => props.theme.medGrey};
`;
const PostAuthor = styled.span`
  float: left;
`;
const PostDate = styled.span`
  float: right;
`;


/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query genericTemplate($slug: String!) {
    allSlugs: allMarkdownRemark {
      edges {
        node {
          fields {
            slug
            chapterOrder
            postOrder
          }
        }
      }
    }
    postBySlug: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      excerpt
      frontmatter {
        title
        author
        date
      }
      fields {
        slug
      }
    }
  }
`;
