import React, { useContext } from "react";
import ScrollableAnchor from '../../vendored/react-scrollable-anchor/index';
import { SmallSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import DatasetSelect from "../components/Datasets/dataset-select";
import { GroupCards } from "../components/splash/userGroups";
import GenericPage from "../layouts/generic-page";
import { UserContext } from "../layouts/userDataWrapper";
import { DataFetchErrorParagraph } from "../components/splash/errorMessages";
import { groupsTitle, GroupsAbstract } from "../../data/SiteConfig";

const datasetColumns = ({isNarrative}) => [
  {
    name: isNarrative ? "Narrative" : "Dataset",
    value: (d) => d.request.replace("/groups/", "").replace(/\//g, " / "),
    url: (d) => d.url
  },
  {
    name: "Group Name",
    value: (d) => d.request.split("/")[2],
    url: (d) => `/groups/${d.request.split("/")[2]}`
  }
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
        {/* These cards dont go nicely into FlexCenter as they manage their own spacing */}
        <GroupCards squashed/>
        <HugeSpacer />

        <ScrollableAnchor id={'datasets'}>
          <splashStyles.H2>Available Datasets</splashStyles.H2>
        </ScrollableAnchor>
        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {`Note that this listing is refreshed every ~6 hours.
            To see a current listing, visit the page for that group by clicking on that group's tile, above.`}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <HugeSpacer />
        {this.state.dataLoaded && (
          <DatasetSelect
            datasets={this.state.datasets}
            columns={datasetColumns({isNarrative: false})}
          />
        )}
        <HugeSpacer />
        <ScrollableAnchor id={'narratives'}>
          <splashStyles.H2>Available Narratives</splashStyles.H2>
        </ScrollableAnchor>
        {this.state.dataLoaded && (
          <DatasetSelect
            datasets={this.state.narratives}
            columns={datasetColumns({isNarrative: true})}
          />
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
