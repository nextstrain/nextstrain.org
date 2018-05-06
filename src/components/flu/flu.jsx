import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components";
import SEO from "../../components/SEO/SEO";
import NavBar from '../../components/nav-bar';

export default class AboutPage extends React.Component {
  render() {
    return (
      <div>
        <Helmet>
          <title>{`About Nextstrain`}</title>
        </Helmet>
        <SEO />
          <NavBar location={this.props.location} />
        <BodyContainer>
          <div>
            F L U
          </div>
        </BodyContainer>
      </div>
    );
  }
}

const BodyContainer = styled.div`
  overflow: scroll;
  justify-self: center;
  width: 100%;
`
