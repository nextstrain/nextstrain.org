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

const nextstrainLogoPNG = require("../../static/logos/favicon.png");

const title = "Nextstrain-maintained Datasets";
const abstract = `This page details datasets maintained by the Nextstrain team.`;


const tableColumns = [
  {
    name: "Dataset",
    value: (dataset) => dataset.name,
    url: (dataset) => dataset.url
  },
  {
    name: "Type",
    value: (dataset) => dataset.type
  },
  {
    name: "Contributor",
    value: () => "Nextstrain",
    valueMobile: () => "",
    url: () => "https://nextstrain.org",
    logo: () => (<img alt="nextstrain.org" className="logo" width="24px" src={nextstrainLogoPNG}/>)
  }
];


class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {data: undefined, errorFetchingData: false};
  }

  async componentDidMount() {
    try {
      const data = await getDatasetsAndNarratives("/charon/getAvailable");
      this.setState({data});
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
        <HugeSpacer /> <HugeSpacer />

        {this.state.data && (
          <DatasetSelect
            datasets={this.state.data}
            columns={tableColumns}
            urlDefinedFilterPath={this.props["*"]}
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

export async function getDatasetsAndNarratives(url) {
  const available = await fetchAndParseJSON(url);
  const formatName = (x) => x.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, " / ");
  const data = [];
  if (available.datasets) {
    available.datasets.forEach((d) => {
      data.push({
        url: d.request,
        filename: d.request,
        name: formatName(d.request),
        type: "Dataset"
      });
    });
  }
  if (available.narratives) {
    available.narratives.forEach((d) => {
      data.push({
        url: d.request,
        filename: d.request,
        name: formatName(d.request),
        type: "Narrative"
      });
    });
  }
  return data;
}

export default Index;
