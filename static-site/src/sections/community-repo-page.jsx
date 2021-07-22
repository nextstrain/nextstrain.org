import React from "react";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import { HugeSpacer } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import DatasetSelect from "../components/Datasets/dataset-select";
import GenericPage from "../layouts/generic-page";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import { ErrorBanner } from "../components/splash/errorMessages";
import GroupHeading from "../components/splash/groupHeading";

class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
    const nonExistentDatasetName = this.props["*"];
    this.state = {
      repoNotFound: false,
      nonExistentDatasetName
    };
  }

  // parse getAvailable listing into one that dataset-select component accepts
  createDatasetListing = (list, userName, repoName) => {
    return list.map((d) => {
      return {
        filename: d.request.replace(`community/${userName}/${repoName}/`, '').replace('narratives/', ''),
        url: `/${d.request}`,
        contributor: userName
      };
    });
  };

  async componentDidMount() {
    const {userName, repoName} = this.props;
    try {
      const [sourceInfo, availableData] = await Promise.all([
        fetchAndParseJSON(`/charon/getSourceInfo?prefix=/community/${userName}/${repoName}/`),
        fetchAndParseJSON(`/charon/getAvailable?prefix=/community/${userName}/${repoName}/`)
      ]);
      this.setState({
        sourceInfo,
        userName,
        repoName,
        datasets: this.createDatasetListing(availableData.datasets, userName, repoName),
        narratives: this.createDatasetListing(availableData.narratives, userName, repoName),
      });
    } catch (err) {
      console.error("Cannot find user/repo.", err.message);
      this.setState({userName, repoName, repoNotFound: true});
    }
  }

  banner() {
    const {userName, repoName} = this.props;
    let bannerTitle, bannerContents;
    // Set up a banner if dataset doesn't exist
    if (this.state.nonExistentDatasetName) {
      bannerTitle = `The dataset "nextstrain.org/community/${userName}/${repoName}/${this.state.nonExistentDatasetName}" doesn't exist.`;
      bannerContents = `Here is the page for the "${repoName}" repository.`;
    }
    // Set up a banner or update the existing one if the repo doesn't exist
    if (this.state.repoNotFound) {
      const notFound = `The Nextstrain Commnity page for GitHub user "${userName}" and repository "${repoName}" doesn't exist yet, or there was an error getting data for that repo.`;
      const linkToCommunityPage = <p>For a list of featured Nextstrain Community datasets, check out the <a href="/community">Community page</a>.</p>;
      if (!bannerTitle) {
        bannerTitle = notFound;
        bannerContents = linkToCommunityPage;
      } else {
        bannerContents = (<>
          {notFound}
          <br/>
          {linkToCommunityPage}
        </>);
      }
    }
    return bannerTitle ? <ErrorBanner title={bannerTitle} contents={bannerContents}/> : null;
  }

  render() {
    const location = this.props.location;
    const banner = this.banner();
    if (this.state.repoNotFound) {
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
                <splashStyles.H4>No datasets are available for this repo.</splashStyles.H4> :
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
                <splashStyles.H4>No narratives are available for this repo.</splashStyles.H4> :
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
