import React from "react";
import { MdPerson } from "react-icons/md";
import { SmallSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import DatasetSelect from "../components/Datasets/dataset-select";
import GenericPage from "../layouts/generic-page";

const nextstrainLogoPNG = require("../../static/logos/favicon.png");

const title = "Nextstrain Groups Datasets";
const abstract = `A listing of all datasets currently available via Public Nextstrain Groups.
Narratives are not yet considered.`;
const tableColumns = [
  {
    name: "Dataset",
    value: (dataset) => dataset.filename.replace(/_/g, ' / ').replace('.json', ''),
    url: (dataset) => dataset.url
  },
  {
    name: "Source",
    value: (dataset) => dataset.source
  },
  {
    name: "Contributor",
    value: (dataset) => dataset.contributor,
    url: (dataset) => dataset.contributorUrl,
    logo: (dataset) => dataset.contributor==="Nextstrain" ?
      <img alt="nextstrain.org" className="logo" width="24px" src={nextstrainLogoPNG}/> :
      <MdPerson/>
  }
];

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      errorFetchingData: false,
      datasetsUrl: "https://staging.nextstrain.org/james/tmp-all-datasets.json"
    };
  }
  async componentDidMount() {
    try {
      const datasets = await fetchAndParseJSON(this.state.datasetsUrl);
      this.setState({
        datasets: datasets.filter((d) => d.source === "Public Group"),
        dataLoaded: true
      });
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      this.setState({errorFetchingData: true});
    }
  }

  render() {
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>

        <HugeSpacer /><HugeSpacer />

        <splashStyles.H2>All datasets</splashStyles.H2>
        <HugeSpacer />
        {this.state.dataLoaded && (
          <DatasetSelect
            datasets={this.state.datasets}
            columns={tableColumns}
            // urlDefinedFilterPath={this.props["*"]}
            intendedUri={this.props.uri}
          />
        )}
        { this.state.errorFetchingData && <splashStyles.CenteredFocusParagraph>
                          Something went wrong getting data.
                          Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                          if this continues to happen.</splashStyles.CenteredFocusParagraph>}

      </GenericPage>
    );
  }
}

export default Index;
