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
      builds: allSARSCoV2Builds.builds,
      hasError: false};
    this.buildsForGeo = this.buildsForGeo.bind(this);
  }

  buildsForGeo(geo) {
    return this.state.builds
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
                  {/* hardcoded structure for now */}
                  <splashStyles.H3 left>Global</splashStyles.H3>
                  {this.buildsForGeo("global")}
                  <splashStyles.H3 left>North America</splashStyles.H3>
                  {this.buildsForGeo("north-america")}
                  <div style={{marginLeft: "15px"}}>
                    <splashStyles.H4 left>USA</splashStyles.H4>
                    {this.buildsForGeo("usa")}
                    <splashStyles.SitRepTitle>Massachusetts</splashStyles.SitRepTitle>
                    <div style={{marginLeft: "15px"}}>
                      <splashStyles.SitRepTitle left>Boston</splashStyles.SitRepTitle>
                      <div style={{marginLeft: "15px"}}>
                        {this.buildsForGeo("boston")}
                      </div>
                    </div>
                  </div>
                  <splashStyles.H3 left>Europe</splashStyles.H3>
                  {this.buildsForGeo("europe")}
                  <div style={{marginLeft: "15px"}}>
                    {this.buildsForGeo("austria")}
                    {this.buildsForGeo("spain")}
                    <splashStyles.SitRepTitle>Switzerland</splashStyles.SitRepTitle>
                    <div style={{marginLeft: "15px"}}>
                      {this.buildsForGeo("switzerland")}
                    </div>
                  </div>
                  <splashStyles.H3 left>Africa</splashStyles.H3>
                  {this.buildsForGeo("africa")}
                  <splashStyles.H3 left>Middle East</splashStyles.H3>
                  {this.buildsForGeo("middle-east")}
                  <splashStyles.H3 left>Asia</splashStyles.H3>
                  {this.buildsForGeo("asia")}
                  <div style={{marginLeft: "15px"}}>
                    {this.buildsForGeo("india")}
                  </div>
                  <splashStyles.H3 left>Oceania</splashStyles.H3>
                  {this.buildsForGeo("oceania")}
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
