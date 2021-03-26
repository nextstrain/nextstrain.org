import React from "react";
import Helmet from "react-helmet";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import { get } from 'lodash';
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
import DatasetSelect from "../components/Datasets/dataset-select";
import DatasetMap from "../components/Datasets/dataset-map";
import SituationReports from "../components/Datasets/sit-reps";
import TOC from "../components/Datasets/toc";
import {parseNcovSitRepInfo} from "../../../auspice-client/customisations/languageSelector";
import sarscov2Catalogue from "../../content/SARS-CoV-2-Datasets.yaml";

const title = "Nextstrain SARS-CoV-2 resources";
const abstract = `Around the world, people are sequencing and sharing SARS-CoV-2
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
    to: "/ncov/global",
    title: "Latest global SARS-CoV-2 analysis",
    subtext: (
      <span>
        Jump to our globally-subsampled SARS-CoV-2 dataset which is updated daily. We also keep updated regional datasets for
        <a href="/ncov/africa?f_region=Africa"> Africa</a>,
        <a href="/ncov/asia?f_region=Asia"> Asia</a>,
        <a href="/ncov/europe?f_region=Europe"> Europe</a>,
        <a href="/ncov/north-america?f_region=North%20America"> North America</a>,
        <a href="/ncov/oceania?f_region=Oceania"> Oceania</a>, and
        <a href="/ncov/south-america?f_region=South%20America"> South America</a>
      </span>
    )
  },
  {
    type: "anchor",
    to: "datasets",
    title: "Scroll down to all available datasets"
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
    subtext: "Drag and drop your sequences to assign them to clades and report potential sequence quality issues. You can use the tool to analyze sequences before you upload them to a database."
  },
  {
    type: "external",
    to: "https://covariants.org/",
    title: "CoVariants (mutations and variants of interest)",
    subtext: "An overview of SARS-CoV-2 mutations that are of interest. The featured mutations are currently mostly associated with spread in Europe; this is simply a reflection that the primary maintainer/author (Emma Hodcroft) works mostly with European data."
  },
  {
    type: "gatsby",
    to: "/search/sars-cov-2",
    title: "Search datasets by strain name(s)",
    subtext: "Search all SARS-CoV-2 nextstrain datasets, including historical ones, for particular strain name(s)",
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
    this.state = {
      catalogueDatasets: sarscov2Catalogue.datasets,
      filterParsed: false
    };
  }

  componentDidMount() {
    try {
      const filterList = parseDatasetsFilterList(this.state.catalogueDatasets);
      this.setState({filterList, filterParsed: true});
    } catch (err) {
      console.error("Error parsing data.", err.message);
    }
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

              <ScrollableAnchor id={"datasets"}>
                <div>
                  <HugeSpacer /><HugeSpacer />
                  <splashStyles.H2 left>
                    All SARS-CoV-2 datasets
                  </splashStyles.H2>
                  <SmallSpacer />
                  <splashStyles.FocusParagraph>
                    This section is an index of public Nextstrain datasets for SARS-CoV-2, organized by geography.
                    Some of these datasets are maintained by the Nextstrain team and others are maintained by independent research groups.
                    If you know of a dataset not listed here, please let us know!
                    Please note that inclusion on this list does not indicate an endorsement by the Nextstrain team.
                  </splashStyles.FocusParagraph>
                  <DatasetMap datasets={this.state.catalogueDatasets}/>
                  <div className="row">
                    <MediumSpacer />
                    <div className="col-md-1"/>
                    <div className="col-md-10">
                      {this.state.filterParsed && <DatasetSelect datasets={this.state.filterList} columns={["dataset", "contributor"]}/>}
                    </div>
                  </div>
                </div>
              </ScrollableAnchor>

              <ScrollableAnchor id={"sit-reps"}>
                <div>
                  <HugeSpacer /><HugeSpacer />
                  <splashStyles.H2 left>
                    All SARS-CoV-2 situation reports
                  </splashStyles.H2>
                  <SmallSpacer />
                  <splashStyles.FocusParagraph>
                    We have been writing interactive situation reports
                    using <a href="https://nextstrain.github.io/auspice/narratives/introduction">Nextstrain Narratives </a>
                    to communicate how COVID-19 is moving around the world and spreading locally.
                    These are kindly translated into a number of different languages by volunteers
                    and Google-provided translators — click on any language below to see the list of situation reports available.
                  </splashStyles.FocusParagraph>
                  <div className="row">
                    <MediumSpacer />
                    <div className="col-md-1"/>
                    <div className="col-md-10">
                      <SituationReports parseSitRepInfo={parseNcovSitRepInfo}/>
                    </div>
                  </div>
                </div>
              </ScrollableAnchor>

              <Footer />
            </splashStyles.Container>
          </main>
        </div>
      </MainLayout>
    );
  }
}

// The dataset-select (dataset filter) component
// requires certain properties.
// We are still using a manually-curated YAML
// for sars-cov-2 datasets which has a special
// format that doesn't have some of those
// properties so we try to add them in here.
function parseDatasetsFilterList(datasets) {
  return datasets
  .filter((d) => d.url)
  .map((dataset) => {
    dataset.filename = dataset.url
    .replace(/^.*?\/\//, '') // prefix and double slash
    .replace(/^.*?\//, '') // everything up to and including first / (after removing prefix slashes, so should just be dataset path)
    .replace('groups/', '')
    .replace('community/', '')
    .replace(/\?.*$/g, '') // query
    .replace(/\/$/g, '') // trailing slash
    .replace(/\//g, '_');
    if (dataset.filename === '') dataset.filename = dataset.name;
    dataset.contributor = get(dataset, "org.name");
    dataset.contributorUrl = get(dataset, "org.url");
    return dataset;
  });
}

export default Index;
