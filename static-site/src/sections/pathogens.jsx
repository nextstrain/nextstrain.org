import React from "react";
import { configureAnchors } from "react-scrollable-anchor";
import { Link } from 'gatsby';
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import ListResources from "../components/ListResources/index";
import * as splashStyles from "../components/splash/styles";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import GenericPage from "../layouts/generic-page";
import { AnchorLink } from "../components/Datasets/pathogen-page-introduction";


const title = "Nextstrain-maintained pathogen analyses";
const abstract = (
  <>
    These data represent analyses and situation-reports produced by the <Link to="/team">core Nextstrain team</Link>.
    Explore analyses produced by others on the <Link to="/groups">Groups</Link> and <Link to="/community">Community</Link> pages.
    <br/><br/>
    We aim to provide a continually-updated view of publicly available data to show pathogen evolution and epidemic spread.
    The pipeline used to generate each dataset is available on <a href="https://github.com/nextstrain/">our GitHub page</a> or by loading a dataset and
    clicking the &ldquo;built with&rdquo; link at the top of the page.
    While we strive to keep datasets updated, there may be some staleness; the date when the dataset was updated can be found at the top of each visualisation.
    In particular, data with a datestamp in the table below <small>(YYYY-MM-DD)</small> reflects an analysis at a point in time.
    <br/><br/>
    <AnchorLink to={"search"} title={"Click here to scroll down to all Nextstrain-maintained pathogen analyses"} />.
  </>
);

class Index extends React.Component {
  constructor(props) {
    super(props);
    configureAnchors({ offset: -10 });
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
    console.log("Render cycle for <Pathogens>")
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>

        <HugeSpacer/>
        <ListResources/>
        <HugeSpacer/>
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
