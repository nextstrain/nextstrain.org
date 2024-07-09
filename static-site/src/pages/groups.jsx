import React, { useContext } from "react";
import ScrollableAnchor from '../../vendored/react-scrollable-anchor/index';
import { SmallSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import DatasetSelect from "../components/Datasets/dataset-select";
import ListResources from "../components/ListResources/index";
import { GroupTiles } from "../components/Groups/Tiles";
import GenericPage from "../layouts/generic-page";
import { UserContext } from "../layouts/userDataWrapper";
import { DataFetchErrorParagraph } from "../components/splash/errorMessages";
import { groupsTitle, GroupsAbstract } from "../../data/SiteConfig";

const resourceListingCallback = async () => {
  const sourceUrl = "/charon/getAvailable?prefix=/groups/";

  const response = await fetch(sourceUrl);
  if (response.status !== 200) {
    throw new Error(`fetching data from "${sourceUrl}" returned status code ${response.status}`);
  }

  const datasets = (await response.json()).datasets;
  // Use an empty array as the value side, to indicate that there are
  // no dated versions associated with this data
  const pathVersions = Object.assign(
    ...datasets.map((ds) => ({
      [ds.request.replace(/^\/groups\//, "")]: []
    })),
  );

  return { pathPrefix: "groups/", pathVersions };
};

const datasetColumns = [
  {
    name: "Narrative",
    value: (d) => d.request.replace("/groups/", "").replace(/\//g, " / "),
    url: (d) => d.url,
  },
  {
    name: "Group Name",
    value: (d) => d.request.split("/")[2],
    url: (d) => `/groups/${d.request.split("/")[2]}`,
  },
];

const GroupListingInfo = () => {
  const { user } = useContext(UserContext);
  return (
    <FlexCenter>
      <splashStyles.CenteredFocusParagraph>
        Click on any tile to view the different datasets and narratives available for that group.
        {user ?
          <> A padlock icon indicates a private group which you ({user.username}) have access to.</> :
          <> These groups are all public, to see private groups please <a href="/login">log in</a>.</>}
      </splashStyles.CenteredFocusParagraph>
    </FlexCenter>
  );
};

// GenericPage needs to be a parent of GroupsPage for the latter to know about
// UserContext, specifically for class functions to be able to use `this.context`.
// We `export default Index` below.
const Index = props => (
  <GenericPage location={props.location}>
    <GroupsPage/>
  </GenericPage>
);

class GroupsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      errorFetchingData: false,
      datasets: [],
      narratives: []
    };
  }

  static contextType = UserContext;

  async componentDidMount() {
    try {
      const available = await fetchAndParseJSON("/charon/getAvailable?prefix=/groups");
      this.setState({
        datasets: cleanUpAvailable(available['datasets']),
        narratives: cleanUpAvailable(available['narratives']),
        dataLoaded: true
      });
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      this.setState({errorFetchingData: true});
    }
  }

  render() {
    return (
      <>
        <splashStyles.H1>{groupsTitle}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            <GroupsAbstract />
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <HugeSpacer /><HugeSpacer />

        <splashStyles.H2>Available groups</splashStyles.H2>
        <GroupListingInfo/>
        {/* These tiles dont go nicely into FlexCenter as they manage their own spacing */}
        <GroupTiles />
        <HugeSpacer />

        <ListResources
          resourceType="dataset"
          versioned={false}
          resourceListingCallback={resourceListingCallback}/>

        <HugeSpacer />

        <ScrollableAnchor id={'narratives'}>
          <splashStyles.H2>Available Narratives</splashStyles.H2>
        </ScrollableAnchor>

        {this.state.dataLoaded && (
          <DatasetSelect
            datasets={this.state.narratives}
            columns={datasetColumns}/>
        )}
        { this.state.errorFetchingData && <DataFetchErrorParagraph />}

      </>
    );
  }
}

function cleanUpAvailable(datasets) {
  /* The dataset display & filtering has a number of hardcoded assumptions and TODOs, which
  requires us to coerce dataset lists into a specific format */
  if (!datasets) return [];
  return datasets.map((d) => ({
    ...d,
    filename: d.request.replace(/\//g, "_").replace(/^_/, ''),
    url: d.request
  }));
}

export default Index;
