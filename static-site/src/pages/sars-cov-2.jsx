import React from "react";
import Helmet from "react-helmet";
import ScrollableAnchor, { configureAnchors } from 'react-scrollable-anchor';
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { SmallSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";
import ListOfBuilds from "../components/sars-cov-2/builds";
import SituationReports from "../components/sars-cov-2/sit-reps";
import TOC from "../components/sars-cov-2/toc";


const title = "Nextstrain SARS-CoV-2 resources";
const abstract = "Brief summary of SARS-CoV and Nextstrain";
const contents = [
  {type: "external", to: "/ncov/global", msg: "Latest global SARS-CoV-2 build (daily updates)"},
  {type: "external", to: "https://nextclade.nextstrain.org", msg: "Nextclade (drag-and-drop FASTA utility)"},
  {type: "gatsby", to: "/search/sars-cov-2", msg: "Search all our datasets by strain name(s)"},
  {type: "anchor", to: "builds", msg: "List all available builds"},
  {type: "anchor", to: "sit-reps", msg: "List all available situation reports"}
];


// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
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
              <splashStyles.H1>{title}</splashStyles.H1>
              <SmallSpacer />

              <FlexCenter>
                <splashStyles.CenteredFocusParagraph>{abstract}</splashStyles.CenteredFocusParagraph>
              </FlexCenter>


              <TOC data={contents}/>


              <ScrollableAnchor id={'builds'}>
                <ListOfBuilds/>
              </ScrollableAnchor>


              <ScrollableAnchor id={'sit-reps'}>
                <SituationReports/>
              </ScrollableAnchor>


              <Footer />


            </splashStyles.Container>
          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;
