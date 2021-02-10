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
import BuildCatalogue from "../components/build-pages/builds";
import TOC from "../components/build-pages/toc";

const title = "Influenza resources";
const abstract = `[replace with intro to flu] Around the world, people are sequencing and sharing SARS-CoV-2
genomic data. The Nextstrain team analyzes these data on a global and continental
level. More specific analysis are often performed by groups around the world.
This page lists publicly available SARS-CoV-2 analyses that use Nextstrain from
groups all over the world. In addition to exploring SARS-CoV-2 evolution
in finished analyses, you can use our new Nextclade tool to compare your sequences
to the SARS-CoV-2 reference sequence, assign them to clades, and see where they fall
on a the SARS-CoV-2 tree.`;

const contents = [
  {
    type: "external",
    to: "/flu/seasonal/h3n2/ha/2y",
    title: "Latest A/H3N2 analysis",
    subtext: (
      <span>
        Jump to our latest A/H3N2 seasonal influenza build which is updated weekly. We also maintain builds for:
        <br/><a href="/flu/seasonal/h1n1pdm/ha/2y"> A/H1N1pdm</a>
        <br/><a href="/flu/seasonal/vic/ha/2y"> B/Vic</a>
        <br/><a href="/flu/seasonal/yam/ha/2y"> B/Yam</a>
        <br/><a href="/flu/avian/h5n1/ha"> A/H5N1 (Avian)</a>
        <br/><a href="/flu/avian/h5nx/ha"> A/H5NX (Avian)</a>
        <br/><a href="/flu/avian/h7n9/ha"> A/H7N9 (Avian)</a>
        <br/><a href="/flu/avian/h9n2/ha"> A/H9N2 (Avian)</a>
      </span>
    )
  },
  {
    type: "anchor",
    to: "builds",
    title: "Scroll down to all available builds (datasets)"
  },
  {
    type: "external",
    to: "https://clades.nextstrain.org",
    title: "Nextclade (sequence analysis webapp)",
    subtext: "Drag and drop your sequences to assign them to clades and report potential sequence quality issues. You can use the tool to analyze sequences before you upload them to a database."
  },
  {
    type: "gatsby",
    to: "/search/seasonal-flu",
    title: "Search seasonal flu builds by strain name(s)",
    subtext: "Search all seasonal influenza nextstrain builds, including historical ones, for particular strain name(s)",
  },
  {
    type: "external",
    to: "https://discussion.nextstrain.org",
    title: "Nextstrain discussion forum",
    subtext: "See here for previously asked questions about Nextstrain or ask your own"
  },
  {
    type: "external",
    to: "https://github.com/nextstrain/.github/blob/master/CONTRIBUTING.md",
    title: "Developer contributions",
    subtext: "We have received a number of generous offers to contribute to the development of Nextstrain - this provides an entry point for how you may be able help"
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
                <BuildCatalogue buildsUrl="https://staging.nextstrain.org/all-influenza-builds.yaml"
                  title="Influenza builds"
                  info={<>This section is an index of public Nextstrain builds (datasets) for flu, organized by type.
                    See <a href="https://docs.nextstrain.org/projects/augur/en/stable/faq/what-is-a-build.html" >here</a> for more information on what a build is.
                    If you know of a build not listed here, please let us know!
                    Please note that inclusion on this list does not indicate an endorsement by the Nextstrain team.</>}
                />
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
