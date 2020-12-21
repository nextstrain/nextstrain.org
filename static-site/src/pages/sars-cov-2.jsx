import React from "react";
import Helmet from "react-helmet";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import config from "../../data/SiteConfig";
import NavBar from "../components/nav-bar";
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import {
  SmallSpacer,
  MediumSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";
import ListOfBuilds from "../components/sars-cov-2/builds";
import SituationReports from "../components/sars-cov-2/sit-reps";
import TOC from "../components/sars-cov-2/toc";

const title = "Nextstrain SARS-CoV-2 resources";
const abstract = `Around the world, people are sequencing SARS-CoV-2. The Nextstrain
team analyzes these data on a global and continental level. More specific analysis
are often provided by groups around the world. This page lists all SARS-CoV-2 analysis
that use nextstrain that we are aware of. In addition to exploring SARS-CoV-2 evolution
in finished analyses, you can use our new Nextclade tool to compare your sequences
to the SARS-CoV-2 reference sequence, assign them to clades, and see where they fall
on a the SARS-CoV-2 tree.`;

const contents = [
  {
    type: "external",
    to: "/ncov/global",
    title: "Latest global SARS-CoV-2 analysis",
    subtext: (
      <span>
        Jump to our latest global SARS-CoV-2 build which is updated daily. We also maintain regional builds for
        <a href="https://nextstrain.org/ncov/north-america"> North America</a>,
        <a href="https://nextstrain.org/ncov/south-america"> South America</a>,
        <a href="https://nextstrain.org/ncov/europe"> Europe</a>,
        <a href="https://nextstrain.org/ncov/asia"> Asia</a>,
        <a href="https://nextstrain.org/ncov/africa"> Africa</a>, and
        <a href="https://nextstrain.org/ncov/oceania"> Oceania</a>,
      </span>
    )
  },
  {
    type: "anchor",
    to: "builds",
    title: "Scroll down to all available builds (datasets)"
  },
  {
    type: "anchor",
    to: "sit-reps",
    title: "Scroll down to all available interactive situation reports",
  },
  {
    type: "external",
    to: "https://clades.nextstrain.org",
    title: "Nextclade (sequence analysis webapp)",
    subtext: "Drag & drop your (FASTA) sequences to assign your sequences to clades and report potential sequence quality issues. You can use the tool to analyze sequences before you upload them to a database."
  },
  {
    type: "gatsby",
    to: "/search/sars-cov-2",
    title: "Search builds by strain name(s)",
    subtext: "Search all SARS-CoV-2 nextstrain builds, including historical ones, for particular strain name(s).",
  },
  {
    type: "external",
    to: "https://github.com/emmahodcroft/cluster_scripts/blob/master/README.md",
    title: "SARS-CoV-2 Mutations of Interest",
    subtext: "An overview of SARS-CoV-2 mutations that are of interest. The featured mutations are currently mostly associated with spread in Europe; this is simply a reflection that the primary maintainer/author (Emma Hodcroft) works mostly with European data."
  },
  {
    type: "external",
    to: "/groups/blab/sars-like-cov",
    title: "Phylogeny of SARS-like betacoronaviruses",
    subtext: (<span>
      We also have a more general phylogeny of <a href="/groups/blab/beta-cov"> betacoronaviruses</a>.
    </span>)
  },
  {
    type: "external",
    to: "https://nextstrain.github.io/ncov/",
    title: "How to run your own phylogenetic analysis of SARS-CoV-2",
    subtext: "A tutorial walking through running your own analysis using Nextstrain tools"
  },
  {
    type: "external",
    to: "https://discussion.nextstrain.org",
    title: "Nextstrain discussion forum",
    subtext: "See here for previously asked questions about Nextstrain or ask your own!"
  },
  {
    type: "external",
    to: "https://github.com/nextstrain/.github/blob/master/CONTRIBUTING.md",
    title: "Developer contributions",
    subtext: "We have received a number of generous offers to contribute to the development of Nextstrain - this provides an entry point for how you may be able help!"
  }
];


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
              <HugeSpacer /><HugeSpacer />
              <splashStyles.H1>{title}</splashStyles.H1>
              <SmallSpacer />

              <FlexCenter>
                <splashStyles.CenteredFocusParagraph>
                  {abstract}
                </splashStyles.CenteredFocusParagraph>
              </FlexCenter>
              <MediumSpacer />

              <TOC data={contents} />

              <ScrollableAnchor id={"builds"}>
                <ListOfBuilds />
              </ScrollableAnchor>

              <ScrollableAnchor id={"sit-reps"}>
                <SituationReports />
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
