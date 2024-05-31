import React from "react";
import ScrollableAnchor, { configureAnchors } from '../../vendored/react-scrollable-anchor/index';
import { HugeSpacer } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import DatasetSelect from "../components/Datasets/dataset-select";
import GenericPage from "../layouts/generic-page";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import { ErrorBanner } from "../components/splash/errorMessages";
import SourceInfoHeading from "../components/splash/sourceInfoHeading";

class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
    this.state = {
      repoNotFound: false,
    };
  }

  // parse getAvailable listing into one that dataset-select component accepts
  createDatasetListing = (list, userName) => {
    if (!list) return [];

    // Note that the `request` always includes @branch, irregardless of URL.
    return list.map((d) => {
      return {
        // filename will be used by <DatasetSelect> as the display name
        filename: d.request.replace(/\/?(community\/)?(narratives\/)?[^/]+\/[^/]+\/?/, ''),
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
        datasets: this.createDatasetListing(availableData.datasets, userName),
        narratives: this.createDatasetListing(availableData.narratives, userName),
      });
    } catch (err) {
      console.error("Cannot find user/repo.", err.message);
      this.setState({userName, repoName, repoNotFound: true});
    }
  }

  banner() {
    const {isNarrative, userName, repoName, resourcePath, nonDefaultResourcePathParts} = this.props;
    let bannerTitle, bannerContents;
    // Set up a banner if we have additional resource path parts dataset or narrative doesn't exist
    if (isNarrative || nonDefaultResourcePathParts.length) {
      bannerTitle = isNarrative
        ? `The narrative "nextstrain.org/${resourcePath}" doesn't exist.`
        : `The dataset "nextstrain.org/${resourcePath}" doesn't exist.`;
      bannerContents = `Here is the page for the "${userName}/${repoName}" repository.`;
    }
    // Set up a banner or update the existing one if the repo doesn't exist
    if (this.state.repoNotFound) {
      const notFound = (<>
        The GitHub repository <a href={`https://github.com/${userName}/${repoName}`}>{userName}/{repoName}</a> {"doesn't"} exist (or is private), or there was an error getting data for that repository.
      </>);
      const description = (<>
        <p>If {"you're"} setting up your own Community on GitHub repository, see <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html">our documentation</a>.</p>
        <p>For a list of featured Nextstrain Community datasets, check out the <a href="/community">Community page</a>.</p>
      </>);
      if (!bannerTitle) {
        bannerTitle = notFound;
        bannerContents = description;
      } else {
        bannerContents = (<>
          <p>{notFound}</p>
          {description}
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
        <SourceInfoHeading sourceInfo={this.state.sourceInfo}/>
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
