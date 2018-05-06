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
        <NavBarContainer>
          <NavBar location={this.props.location} />
        </NavBarContainer>
        <BodyContainer>
          <div>
            F L U
          </div>
        </BodyContainer>
      </div>
    );
  }
}

const NavBarContainer = styled.div`
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  z-index: 2;
   @media screen and (max-width: 600px) {
    order: 1;
  }
`
const BodyContainer = styled.div`
  overflow: scroll;
  justify-self: center;
  width: 100%;
`
