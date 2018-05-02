import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components"
import SEO from "../components/SEO/SEO"
import Navigation from '../components/Header'
// import config from "../../data/SiteConfig"
import Sidebar from "../components/Sidebar";
import {parseSlug} from "../utils/parseSlug"
import {HeaderContainer, CenteredContent} from "../layouts/generalComponents";

export default class GenericTemplate extends React.Component {
  render() {
    // console.log("genericTemplate props:", this.props)
    const { slug } = this.props.pathContext; /* defined by createPages */
    const postNode = this.props.data.postBySlug;
    const post = postNode.frontmatter;
    const selectedPostMeta = parseSlug(slug);
    const otherPostsMeta = this.props.data.allSlugs.edges
      .map((e) => ({
        ...parseSlug(e.node.fields.slug),
        chapterOrder: e.node.fields.chapterOrder,
        postOrder: e.node.fields.postOrder
      }))
      .filter((d) => d.category === selectedPostMeta.category)
    return (
      <div>
        <Helmet>
          <title>{post.title}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <HeaderContainer>
          <Navigation location={this.props.location} />
        </HeaderContainer>
        <SidebarBodyFlexContainer>
          <SidebarContainer>
            <Sidebar
              selectedPostMeta={selectedPostMeta}
              otherPostsMeta={otherPostsMeta}
            />
          </SidebarContainer>
          <ContentContainer>
            <CenteredContent>
              <PostTitle>{post.title}</PostTitle>
              <PostAuthorSurrounds>
                <PostAuthor>{post.author}</PostAuthor>
                <PostDate>{post.date}</PostDate>
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
  height: 100vh;
  overflow: hidden;  /*makes the body non-scrollable (we will add scrolling to the sidebar and main content containers)*/
  display: flex;  /*enables flex content for its children*/
  flex-direction: row;
`

const SidebarContainer = styled.div`
  flex-grow: 1;  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: scroll;  /*adds scroll to this container*/
  width: 300px;
  min-width: 300px;
`

const ContentContainer = styled.div`
  flex-grow: 1;  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: scroll;  /*adds scroll to this container*/
`

const MarkdownContent = styled.div`

  li > ul {
    padding-left: 30px;
  }
  li {
    margin-left: 30px;
  }
`

const PostTitle = styled.h1`
  background-color: black;
  color: white;
  padding: 5px;
  font-weight: 500;
`
const PostAuthorSurrounds = styled.div`
  min-height: 2rem;
  font-size: ${props=>props.theme.niceFontSize};
  font-weight: 100;
  color: ${props=>props.theme.medGrey};
`
const PostAuthor = styled.span`
  float: left;
`
const PostDate = styled.span`
  float: right;
`


/* eslint no-undef: "off"*/
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
