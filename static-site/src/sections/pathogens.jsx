import React from "react";
import ScrollableAnchor, { configureAnchors } from "react-scrollable-anchor";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import DatasetSelect from "../components/Datasets/dataset-select";
import { fetchAndParseJSON } from "../util/datasetsHelpers";
import GenericPage from "../layouts/generic-page";
import Cards from "../components/Cards/index";
import CardsV2 from "../components/CardsV2/index";
import pathogenCards from "../components/Cards/pathogenCards";
import { AnchorLink } from "../components/Datasets/pathogen-page-introduction";
import { DataFetchErrorParagraph } from "../components/splash/errorMessages";

const nextstrainLogoPNG = "/favicon.png";

const title = "Nextstrain-maintained pathogen analyses";
const abstract = (
  <>  
    These data represent analyses and situation-reports produced by the core Nextstrain team.
    We aim to provide a continually-updated view of publicly available data to show pathogen evolution and epidemic spread.
    The pipeline used to generate each dataset is available on <a href="https://github.com/nextstrain/">our GitHub page</a> or by loading a dataset and
    clicking the &ldquo;built with&rdquo; link at the top of the page.
    We strive to keep datasets updated at a regular cadence, and the cards below indicate the frequency of updates to each dataset over the past 2 years. 
    <br/><br/>
    To learn more about nextstrain please see <a href="https://docs.nextstrain.org/en/latest/index.html">our documentation</a> or ask a question
    on the <a href="https://discussion.nextstrain.org/">discussion forum</a>.
    <br/><br/>
    <AnchorLink to={"search"} title={"Click here to scroll down to the Nextstrain-authored narratives"} />.
    <br/><br/>
    Quick links:
  </>
);

const tableColumns = [
  {
    name: "Name",
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
    configureAnchors({ offset: -10 });
    this.state = {data: undefined, errorFetchingData: false};
  }

  async componentDidMount() {
    try {
      const data = await getNarratives("/charon/getAvailable");
      this.setState({data});
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      this.setState({errorFetchingData: true});
    }
  }

  render() {
    console.log('<Pathogens>')
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <Cards squashed cards={pathogenCards}/>

        <CardsV2 apiQuery={'prefix=/&versions&type=dataset'} dataType='dataset'/>

        {/*  ----- NARRATIVE TABLE ------- */}
        <HugeSpacer />
        <HugeSpacer />
        <ScrollableAnchor id={"search"}>
          <div>
            {this.state.data && (
              <DatasetSelect
                title="Nextstrain-authored narratives "
                datasets={this.state.data}
                columns={tableColumns}
              />
            )}
            {this.state.errorFetchingData && <DataFetchErrorParagraph />}
          </div>
        </ScrollableAnchor>
      </GenericPage>
    );
  }
}

export async function getNarratives(url) {
  const available = await fetchAndParseJSON(url);
  const formatName = (x) => x.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, " / ");
  const data = [];
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
