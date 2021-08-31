import React from "react";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import {
  SmallSpacer,
  MediumSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { PathogenPageIntroduction } from "../components/Datasets/pathogen-page-introduction";
import DatasetSelect from "../components/Datasets/dataset-select";
import GenericPage from "../layouts/generic-page";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import { ErrorBanner } from "../components/splash/errorMessages";
import Cards from "../components/Cards/index";
import fluCards from "../components/Cards/fluCards";

const nextstrainLogoPNG = require("../../static/logos/favicon.png");

const title = "Influenza resources";
const abstract = `The Nextstrain team maintains datasets and other tools for analyzing a variety of influenza viruses.
We track the evolution of seasonal influenza viruses (A/H3N2, A/H1N1pdm, B/Victoria, and B/Yamagata)
and use these analyses to inform recommendations for the World Health Organization’s influenza vaccine composition meetings.
We also maintain datasets for a subset of avian influenza viruses that have caused recurrent outbreaks in humans
and domestic birds, including novel reassortant H5 viruses.`;

const contents = [
  {
    type: "anchor",
    to: "datasets",
    title: "Scroll down to all available datasets"
  },
  {
    type: "gatsby",
    to: "/search/seasonal-flu",
    title: "Search seasonal flu datasets by strain name(s)",
    subtext: "Search all seasonal influenza nextstrain datasets, including historical ones, for particular strain name(s)",
  }
];

const tableColumns = [
  {
    name: "Dataset",
    value: (dataset) => dataset.filename.replace(/_/g, ' / ').replace('.json', ''),
    url: (dataset) => dataset.url
  },
  {
    name: "Contributor",
    value: () => "Nextstrain",
    valueMobile: () => "",
    url: () => "https://nextstrain.org",
    logo: () => (<img alt="nextstrain.org" className="logo" width="24px" src={nextstrainLogoPNG}/>)
  },
  {
    name: "Uploaded Date",
    value: (dataset) => dataset.date_uploaded
  }
];


class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
    this.state = {
      dataLoaded: false,
      errorFetchingData: false,
      // scripts/collect-datasets.js collects datasets
      // from s3 and writes them to a JSON which is pushed
      // regularly to s3 as a resource we request here
      // representing a list of datasets to display on
      // this page with some info about each.
      datasetsUrl: "https://data.nextstrain.org/datasets_influenza.json"
    };
  }
  async componentDidMount() {
    let datasets;
    let dataLoaded, errorFetchingData = false;
    try {
      datasets = await fetchAndParseJSON(this.state.datasetsUrl);
      dataLoaded = true;
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      errorFetchingData = true;
    }
    this.setState({
      datasets,
      dataLoaded,
      errorFetchingData,
      // For some reason if this is set in the constructor it breaks the banner.
      nonExistentDatasetName: this.props["*"]
    });
  }

  banner() {
    if (this.state.nonExistentDatasetName && (this.state.nonExistentDatasetName.length > 0)) {
      const bannerTitle = `The dataset "nextstrain.org${this.props.location.pathname}" doesn't exist.`;
      const bannerContents = `Here is the influenza page with a list of Nextstrain-maintained influenza datasets.`;
      return <ErrorBanner title={bannerTitle} contents={bannerContents}/>;
    }
    return null;
  }

  render() {
    const banner = this.banner();
    return (
      <GenericPage location={this.props.location} banner={banner}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <MediumSpacer />

        <PathogenPageIntroduction data={contents} />

        <MediumSpacer/>
        <Cards squashed cards={fluCards}/>

        <ScrollableAnchor id={"datasets"}>
          <div>
            <HugeSpacer /><HugeSpacer />
            <splashStyles.H2>
              Influenza datasets
            </splashStyles.H2>
            <MediumSpacer />
            {this.state.dataLoaded && (
              <DatasetSelect
                datasets={this.state.datasets}
                columns={tableColumns}
              />
            )}
            { this.state.errorFetchingData && <splashStyles.CenteredFocusParagraph>
                        Something went wrong getting data.
                        Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                        if this continues to happen.</splashStyles.CenteredFocusParagraph>}
          </div>
        </ScrollableAnchor>
      </GenericPage>
    );
  }
}

export default Index;
