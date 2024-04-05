import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components";
import SEO from "../components/SEO/SEO";
import NavBar from '../components/nav-bar';
import Sidebar from "../components/Sidebar";
import { CenteredContainer, MarkdownContent } from "../layouts/generalComponents";
import UserDataWrapper from "../layouts/userDataWrapper";
import Footer from "../components/Footer";
import MainLayout from "../components/layout";
import { parseMarkdown } from "../util/parseMarkdown";

export default class GenericTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.state = {mql: undefined, sidebarOpen: undefined, mobileDisplay: undefined};
  }
  componentDidMount() {
    /* window listener to see when width changes cross threshold to toggle sidebar */
    /* can't be in the constructor -- https://github.com/gatsbyjs/gatsby/issues/309 */
    const mql = window.matchMedia(`(min-width: 780px)`);
    mql.addListener(() => this.setState({
      sidebarOpen: this.state.mql.matches,
      mobileDisplay: !this.state.mql.matches
    }));
    this.setState({
      mql,
      sidebarOpen: mql.matches,
      mobileDisplay: !mql.matches
    });
  }
  toggleSidebar() {
    this.setState({
      sidebarOpen: !this.state.sidebarOpen
    });
  }
  //
  renderMobileTogglesAndShading() {
    const iconSliders = (
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path d="M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z" fill="#FFFFFF"/>
      </svg>
    );
    const iconX = (
      <svg viewBox="100 90 312 312" xmlns="http://www.w3.org/2000/svg">
        <path d="M356.5 194.6L295.1 256l61.4 61.4c4.6 4.6 4.6 12.1 0 16.8l-22.3 22.3c-4.6 4.6-12.1 4.6-16.8 0L256 295.1l-61.4 61.4c-4.6 4.6-12.1 4.6-16.8 0l-22.3-22.3c-4.6-4.6-4.6-12.1 0-16.8l61.4-61.4-61.4-61.4c-4.6-4.6-4.6-12.1 0-16.8l22.3-22.3c4.6-4.6 12.1-4.6 16.8 0l61.4 61.4 61.4-61.4c4.6-4.6 12.1-4.6 16.8 0l22.3 22.3c4.7 4.6 4.7 12.1 0 16.8z" fill="#FFFFFF"/>
      </svg>
    );
    return (
      <div>
        <MobileToggleIconContainer onClick={this.toggleSidebar}>
          <MobileToggleIcon $sidebarOpen={this.state.sidebarOpen}>
            {this.state.sidebarOpen ? iconX : iconSliders}
          </MobileToggleIcon>
        </MobileToggleIconContainer>
        <GreyOverlay $sidebarOpen={this.state.sidebarOpen} onClick={this.toggleSidebar}/>
      </div>
    );
  }

  render() {
    const {author, date, title, blogUrlName, mdstring, sidebarData} = this.props;
    /* create a description for SEO from the blog metadata */
    const description = `Nextstrain blog post from ${date}; author(s): ${author}`
    return (
      <MainLayout>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <SEO title={title} description={description} blogUrlName={blogUrlName} />
        <SidebarBodyFlexContainer className="container">
          <SidebarContainer $sidebarOpen={this.state.sidebarOpen}>
            <UserDataWrapper>
              <NavBar minified location={this.props.location} />
            </UserDataWrapper>
            <Sidebar
              title="BLOG"
              posts={sidebarData}
            />
          </SidebarContainer>
          <ContentContainer>
            <CenteredContainer>
              <PostAuthorSurrounds>
                <PostAuthor>{author}</PostAuthor>
                <PostDate>{date}</PostDate>
              </PostAuthorSurrounds>
              <PostTitle>{title}</PostTitle>
              <MarkdownContent dangerouslySetInnerHTML={{ __html: markdownHtml(mdstring) }} />
            </CenteredContainer>

            <Footer/>

          </ContentContainer>
          {this.state.mobileDisplay ? this.renderMobileTogglesAndShading() : null}
        </SidebarBodyFlexContainer>
      </MainLayout>
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
  min-width: ${(props) => props.$sidebarOpen ? props.theme.sidebarWidth : "0px"};
  max-width: ${(props) => props.$sidebarOpen ? props.theme.sidebarWidth : "0px"};
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
  visibility: ${(props) => props.$sidebarOpen ? "visible" : "hidden"};
  opacity: ${(props) => props.$sidebarOpen ? "1" : "0"};
  top: 0;
  left: ${(props) => props.$sidebarOpen ? props.theme.sidebarWidth : 0};
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 8000;
  cursor: pointer;
  transition: ${(props) => props.$sidebarOpen ? 'visibility 0s ease-out, left 0.3s ease-out, opacity 0.3s ease-out' : 'left 0.3s ease-out, opacity 0.3s ease-out, visibility 0s ease-out 0.3s'};
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
  border-radius: 45px;
`;
const MobileToggleIcon = styled.div`
  position: absolute;
  width: ${(props) => props.$sidebarOpen ? "30px" : "25px"};
  height: ${(props) => props.$sidebarOpen ? "30px" : "25px"};
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  cursor: pointer;
`;

function markdownHtml(mdstring) {
  try {
    return parseMarkdown(mdstring);
  } catch (error) {
    console.error(`Error parsing markdown: ${error}`);
    return '<p>There was an error parsing markdown content.</p>';
  }
}
