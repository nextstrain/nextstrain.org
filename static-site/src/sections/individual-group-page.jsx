import React from "react";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import { HugeSpacer } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import DatasetSelect from "../components/Datasets/dataset-select";
import GenericPage from "../layouts/generic-page";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import GroupHeading from "../components/splash/groupHeading";
import { ErrorBanner } from "../components/splash/errorMessages";

class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
    const nonExistentDatasetName = this.props["*"];
    this.state = {
      groupNotFound: false,
      nonExistentDatasetName
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
      });
    } catch (err) {
      console.error("Cannot find group.", err.message);
      this.setState({groupName, groupNotFound: true});
    }
  }

  banner() {
    const groupName = this.props["groupName"];
    let bannerTitle, bannerContents;
    // Set up a banner if dataset doesn't exist
    if (this.state.nonExistentDatasetName) {
      bannerTitle = `The dataset "nextstrain.org/groups/${groupName}/${this.state.nonExistentDatasetName}" doesn't exist.`;
      bannerContents = `Here is the page for the "${groupName}" Nextstrain Group.`;
    }
    // Set up a banner or update the existing one if the group doesn't exist
    if (this.state.groupNotFound) {
      const notFound = `The Nextstrain Group "${groupName}" doesn't exist yet, or there was an error getting data for that group.`;
      const linkToGroupsPage = <p>For available Nextstrain Groups, check out the <a href="/groups">Groups page</a>.</p>;
      if (!bannerTitle) {
        bannerTitle = notFound;
        bannerContents = linkToGroupsPage;
      } else {
        bannerContents = (<>
          {notFound}
          <br/>
          {linkToGroupsPage}
        </>);
      }
    }
    return bannerTitle ? <ErrorBanner title={bannerTitle} contents={bannerContents}/> : null;
  }

  render() {
    const location = this.props.location;
    const banner = this.banner();
    if (this.state.groupNotFound) {
      return (
        <GenericPage location={location} banner={banner} />
      );
    }
    if (!this.state.sourceInfo) {
      return (
        <GenericPage location={location} banner={banner}>
          <splashStyles.H2>Data loading...</splashStyles.H2>
        </GenericPage>
      );
    }
    return (
      <GenericPage location={location} banner={banner}>
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
