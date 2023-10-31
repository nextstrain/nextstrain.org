import React from "react";
import Helmet from "react-helmet";
import { graphql } from "gatsby";
import SEO from "../components/SEO/SEO";
import { siteTitle } from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import Splash from "../components/splash";
import UserDataWrapper from "../layouts/userDataWrapper";
import MainLayout from "../components/layout";

class Index extends React.Component {
  render() {
    // Workaround so index page doesn't flash when pages are redirecting
    // See github issue: https://github.com/gatsbyjs/gatsby/issues/5329#issuecomment-484741119
    const browser = typeof window !== "undefined" && window;

    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={siteTitle} />
          <SEO postEdges={postEdges} />
          <main>
            <UserDataWrapper>
              <NavBar location={this.props.location} />
              {browser && <Splash />}
            </UserDataWrapper>
          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
          }
          excerpt
          timeToRead
          frontmatter {
            title
            date
          }
        }
      }
    }
  }
`;
