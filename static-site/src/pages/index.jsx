import React from "react";
import Helmet from "react-helmet";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import Splash from "../components/splash";

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  render() {
    // Workaround so index page doesn't flash when pages are redirecting
    // See github issue: https://github.com/gatsbyjs/gatsby/issues/5329#issuecomment-484741119
    const browser = typeof window !== "undefined" && window;

    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <div className="index-container">
        <Helmet title={config.siteTitle} />
        <SEO postEdges={postEdges} />
        <main>
          <NavBar location={this.props.location} />
          {browser && <Splash />}
        </main>
      </div>
    );
  }
}

export default Index;


/* eslint no-undef: "off" */
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
