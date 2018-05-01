import React from "react"
import Helmet from "react-helmet"
import SEO from "../components/SEO/SEO"
import config from "../../data/SiteConfig"
import Navigation from '../components/Header'
import Splash from "./splash";

class Index extends React.Component {
  render() {
    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <div className="index-container">
        <Helmet title={config.siteTitle} />
        <SEO postEdges={postEdges} />
        <main>
          <Navigation location={this.props.location} />
          <Splash />
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
