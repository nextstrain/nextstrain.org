import React from "react";
import Helmet from "react-helmet";
import { MdPerson } from "react-icons/md";
import config from "../../data/SiteConfig";
import NavBar from "../components/nav-bar";
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { SmallSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";
import { fetchAndParseDatasetsJSON } from "./influenza-page";
import DatasetSelect from "../components/Datasets/dataset-select";

const nextstrainLogoPNG = require("../../static/logos/favicon.png");

const title = "Proof of principle: All known Nextstrain datasets";
const abstract = `A listing of all datasets currently available on (a) Nextstrain Core,
(b) Nextstrain Staging, (c) all Public Nextstrain Groups and (d) community datasets.
Narratives are not yet considered.`;
const tableColumns = [
  {
    name: "Dataset",
    value: (dataset) => dataset.filename.replace(/_/g, ' / ').replace('.json', ''),
    url: (dataset) => dataset.url
  },
  {
    name: "Source",
    value: (dataset) => dataset.source
  },
  {
    name: "Contributor",
    value: (dataset) => dataset.contributor,
    url: (dataset) => dataset.contributorUrl,
    logo: (dataset) => dataset.contributor==="Nextstrain" ?
      <img alt="nextstrain.org" className="logo" width="24px" src={nextstrainLogoPNG}/> :
      <MdPerson/>
  }
];

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      errorFetchingData: false,
      datasetsUrl: "https://staging.nextstrain.org/james/tmp-all-datasets.json"
    };
  }
  async componentDidMount() {
    try {
      const datasets = await fetchAndParseDatasetsJSON(this.state.datasetsUrl);
      this.setState({datasets, dataLoaded: true});
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      this.setState({errorFetchingData: true});
    }
  }

  render() {
    return (
      <MainLayout>
        <div className="index-container">
          <Helmet title={config.siteTitle} />
          <main>
            <UserDataWrapper>
              <NavBar location={this.props.location} />
            </UserDataWrapper>

            <splashStyles.Container className="container">
              <HugeSpacer /><HugeSpacer />
              <splashStyles.H1>{title}</splashStyles.H1>
              <SmallSpacer />

              <FlexCenter>
                <splashStyles.CenteredFocusParagraph>
                  {abstract}
                </splashStyles.CenteredFocusParagraph>
              </FlexCenter>

              <HugeSpacer /><HugeSpacer />

              <splashStyles.H2>All datasets</splashStyles.H2>
              <HugeSpacer />
              {this.state.dataLoaded && (
                <DatasetSelect
                  datasets={this.state.datasets}
                  columns={tableColumns}
                  urlDefinedFilterPath={this.props["*"]}
                  intendedUri={this.props.uri}
                />
              )}
              { this.state.errorFetchingData && <splashStyles.CenteredFocusParagraph>
                          Something went wrong getting data.
                          Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                          if this continues to happen.</splashStyles.CenteredFocusParagraph>}

              <Footer />
            </splashStyles.Container>
          </main>
        </div>
      </MainLayout>
    );
  }
}

export default Index;
