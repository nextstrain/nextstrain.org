import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components";
import SEO from "../components/SEO/SEO";
import NavBar from '../components/nav-bar';
import Sidebar from "../components/Sidebar";
import { CenteredContainer, MarkdownContent } from "../layouts/generalComponents";

const parseSlug = require("../util/parseSlug");

export default class GenericTemplate extends React.Component {
  constructor(props) {
    console.log("genericTemplate CONSTRUCTOR")
    super(props);
    /* window listener to see when width changes cross threshold to toggle sidebar */
    const mql = window.matchMedia(`(min-width: 780px)`);
    mql.addListener(() => this.setState({
      sidebarOpen: this.state.mql.matches,
      mobileDisplay: !this.state.mql.matches
    }));
    this.state = {
      mql,
      sidebarOpen: mql.matches,
      mobileDisplay: !mql.matches
    };
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }
  toggleSidebar() {
    this.setState({
      sidebarOpen: !this.state.sidebarOpen
    });
  }
  renderMobileTogglesAndShading() {
    return (
      <div>
        <MobileToggleIconContainer onClick={this.toggleSidebar}>
          <MobileToggleIcon>
            <i className={this.state.sidebarOpen ? "fa fa-close" : "fa fa-sliders"} aria-hidden="true"/>
          </MobileToggleIcon>
        </MobileToggleIconContainer>
        <GreyOverlay
          sidebarOpen={this.state.sidebarOpen}
          onClick={this.toggleSidebar}
        />
      </div>
    );
  }
  render() {
    console.log(`sidebarOpen ${this.state.sidebarOpen} mobileDisplay ${this.state.mobileDisplay}`)
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
          <SidebarContainer sidebarOpen={this.state.sidebarOpen}>
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
          {this.state.mobileDisplay ? this.renderMobileTogglesAndShading() : null}
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
  left: 0px;
  min-width: ${(props) => props.sidebarOpen ? props.theme.sidebarWidth : "0px"};
  max-width: ${(props) => props.sidebarOpen ? props.theme.sidebarWidth : "0px"};
  background-color: #F2F2F2;
  box-shadow: -3px 0px 3px -3px rgba(0, 0, 0, 0.2) inset;
  transition: width 0.3s ease-in-out;
`;
/* this doesn't work - probably due to flex? TODO
left: ${(props) => props.sidebarOpen ? 0 : -1 * parseInt(props.theme.sidebarWidth, 10) + "px"};
*/
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
const GreyOverlay = styled.div`
  position: absolute;
  top: 0;
  left: ${(props) => props.sidebarOpen ? props.theme.sidebarWidth : 0};
  width: 100%;
  height: 100%;
  transition: ${(props) => props.sidebarOpen ? 'visibility 0s ease-out, left 0.3s ease-out, opacity 0.3s ease-out' : 'left 0.3s ease-out, opacity 0.3s ease-out, visibility 0s ease-out 0.3s'};
  background-color: rgba(0,0,0,0.5);
  z-index: 8000;
  cursor: pointer;
`;
const MobileToggleIconContainer = styled.div`
  width: 60px;
  height: 60px;
  position: absolute;
  top: 15px;
  left: auto;
  right: 20px;
  z-index: 9000;
  background-color: ${(props) => props.theme.goColor};
  box-shadow: 2px 4px 10px 1px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  padding: 0;
  borderRadius: 45px;
`;
const MobileToggleIcon = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  top: 50%;
  left: 50%;
  line-height: 30px;
  text-align: center;
  transform: translate(-50%,-50%);
  margin-left: auto;
  margin-right: auto;
  vertical-align: middle;
  color: #FFFFFF;
  font-size: 26px;
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
