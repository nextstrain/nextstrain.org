import React from "react";
import Helmet from "react-helmet";
import {Link} from 'gatsby';
import styled from 'styled-components';
import {FaSearch} from "react-icons/fa";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { SmallSpacer, MediumSpacer, HugeSpacer } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";

const Ul = styled.ul`
  font-size: 16px;
  line-height: 1.7;
  list-style: none;
`;

// eslint-disable-next-line react/prefer-stateless-function
class ListSearchPages extends React.Component {
  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>
            <UserDataWrapper>
              <NavBar location={this.props.location} />
            </UserDataWrapper>
            <splashStyles.Container className="container">
              <HugeSpacer />
              <splashStyles.H2>
                Search datasets by sample name
              </splashStyles.H2>
              <SmallSpacer />
              <div className="row">
                <MediumSpacer />
                <div className="col-md-1"/>
                <div className="col-md-10">
                  <Ul>
                    {this.props.pageContext.searchPages && this.props.pageContext.searchPages.map((page) => (
                      <li key={page.displayName}>
                        <Link to={`/search/${page.urlName}`}>
                          <FaSearch/>
                          {page.displayName}
                        </Link>
                      </li>
                    ))}
                  </Ul>
                </div>
              </div>

              <Footer />

            </splashStyles.Container>
          </main>
        </div>
      </MainLayout>
    );
  }
}
export default ListSearchPages;
