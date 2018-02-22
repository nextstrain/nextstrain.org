import React from "react"
import Helmet from "react-helmet"
import styled from "styled-components"

import SEO from "../components/SEO/SEO"
import config from "../../data/SiteConfig"
import CtaButton from '../components/CtaButton'
import Navigation from '../components/Layout/Navigation'

/* removed:
<IndexHeadContainer>
  <Navigation />
  <Hero>
    <h1>{config.siteTitle}</h1>
    <h4>{config.siteDescription}</h4>
  </Hero>
</IndexHeadContainer>


<CtaButton to={'/lesson-one'}>See Your First Post</CtaButton>

*/

class Index extends React.Component {

  render() {
    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <div className="index-container">
        <Helmet title={config.siteTitle} />
        <SEO postEdges={postEdges} />
        <main>
          <Navigation />
          <BodyContainer>
            <h2>nextstrain</h2>
            <h3>phylogenetic data analysis & visualisation</h3>
            <p>{`The nextstrain project is an attempt to make flexible informatic pipelines
              and visualization tools to track ongoing pathogen evolution as sequence data emerges.`}
            </p>
            <p>
              {`This website contains documentation and tutorials. Nextstrain is usable by anyone via `}
              <a href="www.nextstrain.org">www.nextstrain.org</a>
            </p>

            <p>nextstrain is comprised of multiple components</p>
            <ul>
              <li>{`Sacra - data collection and cleaning`}</li>
              <li>{`Flora - data storage`}</li>
              <li>{`Augur - bioinformatics analysis`}</li>
              <li>{`Auspice - interactive visualisation`}</li>
            </ul>

          </BodyContainer>
        </main>
      </div>
    );
  }
}

export default Index;

const IndexHeadContainer = styled.div`
  background: ${props => props.theme.brand};
  padding: ${props => props.theme.sitePadding};
  text-align: center;
`

const Hero = styled.div`
  padding: 50px 0;
  & > h1 {
    font-weight: 600;
  }
`

const BodyContainer = styled.div`
  padding: ${props => props.theme.sitePadding};
  max-width: ${props => props.theme.contentWidthLaptop};
  margin: 0 auto;
`


/* eslint no-undef: "off"*/
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
            tags
            cover
            date
          }
        }
      }
    }
  }
`;
