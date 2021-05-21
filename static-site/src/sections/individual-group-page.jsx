import React from "react";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import { HugeSpacer } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import DatasetSelect from "../components/Datasets/dataset-select";
import GenericPage from "../layouts/generic-page";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import GroupHeading from "../components/splash/groupHeading";
import { MissingGroupsDatasetBanner, GroupNotFound } from "../components/splash/errorMessages";

class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
    this.state = {
      groupNotFound: false
    };
  }

  // parse getAvailable listing into one that dataset-select component accepts
  createDatasetListing = (list, groupName) => {
    return list.map((d) => {
      return {
        filename: d.request.replace(`groups/${groupName}/`, '').replace('narratives/', ''),
        url: `https://nextstrain.org/${d.request}`,
        contributor: groupName
      };
    });
  };

  async componentDidMount() {
    const groupName = this.props["groupName"];
    try {
      const [sourceInfo, availableData] = await Promise.all([
        fetchAndParseJSON(`/charon/getSourceInfo?prefix=/groups/${groupName}/`),
        fetchAndParseJSON(`/charon/getAvailable?prefix=/groups/${groupName}/`)
      ]);
      this.setState({
        sourceInfo,
        groupName,
        datasets: this.createDatasetListing(availableData.datasets, groupName),
        narratives: this.createDatasetListing(availableData.narratives, groupName),
        missingDataset: this.props["*"]
      });
    } catch (err) {
      console.error("Cannot find group.", err.message);
      this.setState({groupName, groupNotFound: true});
    }
  }

  render() {
    const groupName = this.props["groupName"];
    if (this.state.groupNotFound) {
      return (
        <GenericPage location={this.props.location}>
          <GroupNotFound groupName={groupName}/>
        </GenericPage>
      );
    }
    if (!this.state.sourceInfo) {
      return (
        <GenericPage location={this.props.location}>
          <splashStyles.H2>Data loading...</splashStyles.H2>
        </GenericPage>
      );
    }
    return (
      <GenericPage location={this.props.location}>
        {this.state.missingDataset && <MissingGroupsDatasetBanner dataset={this.state.missingDataset} groupName={this.state.groupName}/>}
        <GroupHeading sourceInfo={this.state.sourceInfo}/>
        <HugeSpacer />
        {this.state.sourceInfo.showDatasets && (
          <ScrollableAnchor id={"datasets"}>
            <div>
              <splashStyles.H3>Available datasets</splashStyles.H3>
              {this.state.datasets.length === 0 ?
                <splashStyles.H4>No datasets are available for this group.</splashStyles.H4> :
                <DatasetSelect
                  datasets={this.state.datasets}
                  columns={[
                    {
                      name: "Dataset",
                      value: (dataset) => dataset.filename.replace(/_/g, ' / ').replace('.json', ''),
                      url: (dataset) => dataset.url
                    }
                  ]}
                />
              }
            </div>
          </ScrollableAnchor>
        )}
        <HugeSpacer />
        {this.state.sourceInfo.showNarratives && (
          <ScrollableAnchor id={"narratives"}>
            <div>
              <splashStyles.H3>Available narratives</splashStyles.H3>
              {this.state.narratives.length === 0 ?
                <splashStyles.H4>No narratives are available for this group.</splashStyles.H4> :
                <DatasetSelect
                  datasets={this.state.narratives}
                  columns={[
                    {
                      name: "Narrative",
                      value: (dataset) => dataset.filename.replace(/_/g, ' / ').replace('.json', ''),
                      url: (dataset) => dataset.url
                    }
                  ]}
                  title="Filter Narratives"
                />
              }
            </div>
          </ScrollableAnchor>
        )}
      </GenericPage>
    );
  }
}

export default Index;
