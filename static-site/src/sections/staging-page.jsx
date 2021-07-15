import React from "react";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import DatasetSelect from "../components/Datasets/dataset-select";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import GenericPage from "../layouts/generic-page";
import { ErrorBanner } from "../components/splash/errorMessages";

const nextstrainLogoPNG = require("../../static/logos/favicon.png");

const title = "Staging Data";
const abstract = (
  <>
    This page details Nextstrain-managed datasets and narratives available on our staging server.
    <strong> These datasets should be considered unreleased and/or out of date; they should not be used to draw scientific conclusions</strong>.
    Note that this listing is refreshed about once per hour.
    Narratives are not (yet) listed on this page;
    &quot;Staging narratives&quot; can be found <a target="_blank" rel="noopener noreferrer nofollow" href="https://github.com/nextstrain/narratives/tree/staging" >on GitHub</a>.
  </>
);

const tableColumns = [
  {
    name: "Name",
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
    this.state = {
      data: undefined,
      errorFetchingData: false,
    };
  }

  async componentDidMount() {
    let data;
    let errorFetchingData = false;
    try {
      data = await fetchAndParseJSON("https://staging.nextstrain.org/datasets_staging.json");
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      errorFetchingData = true;
    }
    this.setState({
      data,
      errorFetchingData,
      // For some reason if this is set in the constructor it breaks the banner.
      nonExistentDatasetName: this.props["*"]
    });
  }

  banner() {
    if (this.state.nonExistentDatasetName && (this.state.nonExistentDatasetName.length > 0)) {
      const bannerTitle = `The dataset "nextstrain.org${this.props.location.pathname}" doesn't exist.`;
      const bannerContents = `Here is the staging page instead.`;
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
        <HugeSpacer /> <HugeSpacer />

        {this.state.data && (
          <DatasetSelect
            title="Filter Data "
            datasets={this.state.data}
            columns={tableColumns}
          />
        )}
        {this.state.errorFetchingData && (
          <splashStyles.CenteredFocusParagraph>
            Something went wrong getting data.
            Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
            if this continues to happen.
          </splashStyles.CenteredFocusParagraph>
        )}
      </GenericPage>
    );
  }
}

export default Index;
