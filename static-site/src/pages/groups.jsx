import React, { useContext } from "react";
import ScrollableAnchor from "react-scrollable-anchor";
import { MdPerson } from "react-icons/md";
import { SmallSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import DatasetSelect from "../components/Datasets/dataset-select";
import { GroupCards } from "../components/splash/userGroups";
import GenericPage from "../layouts/generic-page";
import { UserContext } from "../layouts/userDataWrapper";

const nextstrainLogoPNG = require("../../static/logos/favicon.png");

const title = "Scalable Sharing with Nextstrain Groups";
const abstract = (<>
  We want to enable research labs, public health entities
  and others to share their datasets and narratives through Nextstrain with
  complete control of their data and audience. Nextstrain Groups is more scalable
  than community builds in both data storage and viewing permissions. Datasets in
  a public group are accessible to the general public via nextstrain.org, while
  private group data are only visible to logged in users with permission to see
  the data. A single entity can manage both a public and a private group in order
  to share data with different audiences.
  <br/>
  <br/>
  For more details about Nextstrain Groups
  , <a href="https://docs.nextstrain.org/en/latest/guides/share/nextstrain-groups.html">check out our documentation</a>.
  <br/>
  <br/>
  Nextstrain Groups is still in the early stages and require a Nextstrain team
  member to set up and add users.
  Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a> and we’d be happy to set up a group for you.
</>);
const tableColumns = [
  {
    name: "Dataset",
    value: (dataset) => dataset.filename.replace(/_/g, ' / ').replace('.json', ''),
    url: (dataset) => dataset.url
  },
  {
    name: "Group Name",
    value: (dataset) => dataset.contributor,
    url: (dataset) => dataset.contributorUrl,
    logo: (dataset) => dataset.contributor==="Nextstrain" ?
      <img alt="nextstrain.org" className="logo" width="24px" src={nextstrainLogoPNG}/> :
      <MdPerson/>
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
      datasetsUrl: "https://staging.nextstrain.org/james/tmp-all-datasets.json"
    };
  }

  static contextType = UserContext;

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
      <>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <HugeSpacer /><HugeSpacer />

        <splashStyles.H2>Available groups</splashStyles.H2>
        <GroupListingInfo/>
        {/* These cards dont go nicely into FlexCenter as they manage their own spacing */}
        <GroupCards squashed/>
        <HugeSpacer />

        <ScrollableAnchor id={'datasets'}>
          <splashStyles.H2>Nextstrain Groups datasets</splashStyles.H2>
        </ScrollableAnchor>
        <HugeSpacer />
        {this.state.dataLoaded && (
          <DatasetSelect
            datasets={this.state.datasets}
            columns={tableColumns}
            intendedUri={this.props.uri}
          />
        )}
        { this.state.errorFetchingData && <splashStyles.CenteredFocusParagraph>
                          Something went wrong getting data.
                          Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                          if this continues to happen.</splashStyles.CenteredFocusParagraph>}

      </>
    );
  }
}

export default Index;
