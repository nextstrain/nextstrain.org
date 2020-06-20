import React from "react";
import Helmet from "react-helmet";
import {FaFile} from "react-icons/fa";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";
import allSARSCoV2Builds from "../../content/allSARS-CoV-2Builds.yaml";

/*
* This is a page to display all builds for SARS-CoV-2 in one place.
* TODO:
* - abstract 15px left margin
* - tweak yaml design for builds list as necessary
*/

const buildComponent = (build) => (
  <div key={build.url}>
    <splashStyles.SitRepTitle >
      <a href={build.url}>
        <FaFile />
        {` ${build.name} `}
      </a>
      (
      {build.org.url === null ? build.org.name : <a href={build.org.url}>{build.org.name}</a>
      }
      )
    </splashStyles.SitRepTitle>
  </div>);

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false};
    this.buildsForGeo = this.buildsForGeo.bind(this);
  }

  buildsForGeo(geo) {
    return allSARSCoV2Builds.builds
    .filter((b) => b.geo === geo)
    .map((build) => buildComponent(build));
  }

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
                All SARS-CoV-2 Builds
              </splashStyles.H2>
              <SmallSpacer />
              <FlexCenter>
                <splashStyles.CenteredFocusParagraph theme={{niceFontSize: "14px"}}>
                  This page is an index of public Nextstrain builds for SARS-CoV-2, organized by geography. If you know of a build not listed here, please let us know! Please note that inclusion on this list does not indicate an endorsement by the Nextstrain team.
                </splashStyles.CenteredFocusParagraph>
              </FlexCenter>
              <div className="row">
                <MediumSpacer />
                <div className="col-md-1"/>
                <div className="col-md-10">
                  { this.state.hasError && <splashStyles.CenteredFocusParagraph>
                                  Something went wrong getting data.
                                  Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                                  if this continues to happen.</splashStyles.CenteredFocusParagraph>}
                  {allSARSCoV2Builds.builds.map((build) => buildComponent(build))}
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

export default Index;
