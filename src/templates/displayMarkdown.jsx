import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components";
import SEO from "../components/SEO/SEO";
import NavBar from '../components/nav-bar';
import Sidebar from "../components/Sidebar";
import {CenteredContent} from "../layouts/generalComponents";

export default class GenericTemplate extends React.Component {
  render() {
    // console.log("genericTemplate props:", this.props)
    const { slug } = this.props.pathContext; /* defined by createPages */
    const postNode = this.props.data.postBySlug;
    const post = postNode.frontmatter;
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
              sectionNodes={this.props.data.allSlugs.edges}
            />
          </SidebarContainer>
          <ContentContainer>
            <CenteredContent>
              <PostTitle>{post.title}</PostTitle>
              <PostAuthorSurrounds>
                <PostDate>last modified {post.date}</PostDate>
              </PostAuthorSurrounds>
              <MarkdownContent dangerouslySetInnerHTML={{ __html: postNode.html }} />
            </CenteredContent>
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
  min-width: 260px;
  background-color: #F2F2F2;
  box-shadow: -3px 0px 3px -3px rgba(0, 0, 0, 0.2) inset;
`;

const ContentContainer = styled.div`
  flex-grow: 1;  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: scroll;  /*adds scroll to this container*/
`;

const MarkdownContent = styled.div`

  li > ul {
    padding-left: 30px;
  }
  li {
    margin-left: 30px;
  }
`;

const PostTitle = styled.h1`
  background-color: black;
  color: white;
  padding: 5px;
  font-weight: 500;
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
