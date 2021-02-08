import React from "react";
import yaml from "js-yaml";
import { FaChartArea } from "react-icons/fa";
import Collapsible from "react-collapsible";
import { orderBy } from "lodash";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexGridLeft } from "../../layouts/generalComponents";
import * as splashStyles from "../splash/styles";
import CollapseTitle from "../Misc/collapse-title";
import BuildMap from "./build-map";

const buildComponent = (build) => (
  <splashStyles.SitRepTitle >
    {build.url === undefined ? build.name : <div>
      <a href={build.url}>
        <FaChartArea />
        {` ${build.name} `}
      </a>
      (
      {build.org.url === undefined ? build.org.name : <a href={build.org.url}>{build.org.name}</a>
      }
      )
    </div>}
  </splashStyles.SitRepTitle>
);

/*
* This is a page to display a catalogue of builds for a
* given pathogen. static-site/content/allSARS-CoV-2Builds.yaml
* is a manually maintained example of such a catalogue, and
* can be used directly here or augmented
* (using scripts/collect-pathogen-resources.js) with metadata from
* each build and stored in/fetched from props.buildsUrl
*/
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      errorFetchingData: false,
      buildsUrl: props.buildsUrl
    };
    this.buildsForGeo = this.buildsForGeo.bind(this);
    this.subBuilds = this.subBuilds.bind(this);
    this.buildTree = this.buildTree.bind(this);
  }

  async componentDidMount() {
    try {
      const catalogueBuilds = await fetchAndParseBuildCatalogueYaml(this.state.buildsUrl);
      this.setState({catalogueBuilds, dataLoaded: true});
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      this.setState({errorFetchingData: true});
    }
  }

  subBuilds(header, expanded=false, fontSize=20) {
    const children = this.state.catalogueBuilds
      .filter((b) => b.geo === header.geo && b.url);
    const subHeaders = this.state.catalogueBuilds
      .filter((b) => b.parentGeo === header.geo && b.url === undefined);
    return (
      <div key={header.name}>
        <Collapsible
          triggerWhenOpen={<CollapseTitle name={header.name} isExpanded />}
          trigger={<CollapseTitle name={header.name} />}
          triggerStyle={{cursor: "pointer", textDecoration: "none"}}
          transitionTime={100}
          open={expanded}
        >
          {/* Begin collapsible content */}
          <div key={`${header.name}-children`}>
            {children.length > 0 &&
              <FlexGridLeft style={{marginBottom: "10px"}}>
                {children.map((child) => (
                  <div key={child.url}>
                    {buildComponent(child)}
                  </div>
                ))}
              </FlexGridLeft>}
            {subHeaders.length > 0 &&
              <div style={{marginLeft: "20px"}}>
                {orderBy(subHeaders, ["name"]).map((subHeader) =>
                  this.subBuilds(subHeader,
                    subHeaders.length < 5,
                    fontSize > 16 ? fontSize-2 : fontSize))}
              </div>}
          </div>
        </Collapsible>
      </div>);
  }

  buildTree() {
    const headers = this.state.catalogueBuilds.filter((b) => b.url === undefined);
    const roots = headers.filter((b) => b.parentGeo === null);
    return roots.map((root) => this.subBuilds(root));
  }

  buildsForGeo(geo) {
    return this.state.catalogueBuilds
    .filter((b) => b.geo === geo)
    .map((build) => buildComponent(build));
  }

  render() {
    return (
      <>
        <HugeSpacer /><HugeSpacer />
        <splashStyles.H2 left>
          {this.props.title || "Builds"}
        </splashStyles.H2>
        <SmallSpacer />
        <splashStyles.FocusParagraph>
          {this.props.info || ""}
        </splashStyles.FocusParagraph>
        { this.state.dataLoaded && <BuildMap builds={this.state.catalogueBuilds}/> }
        <div className="row">
          <MediumSpacer />
          <div className="col-md-1"/>
          <div className="col-md-10">
            { this.state.errorFetchingData && <splashStyles.CenteredFocusParagraph>
                            Something went wrong getting data.
                            Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                            if this continues to happen.</splashStyles.CenteredFocusParagraph>}
            { this.state.dataLoaded && this.buildTree()}
          </div>
        </div>
      </>
    );
  }
}

// scripts/collect-pathogen-resources.js reads in a list of builds in a manually
// maintained pathogen build catalogue yaml file such as static-site/content/allSARS-CoV-2Builds.yaml
// and produces an augmented version with metadata from each corresponding dataset.
// That augmented yaml file is stored on s3 and fetched here to populate the front-end
// manisfestation of that pathogen build catalogue on the page (e.g. map of builds).
async function fetchAndParseBuildCatalogueYaml(yamlUrl) {
  const catalogueBuilds = await fetch(yamlUrl)
    .then((res) => res.text())
    .then((text) => yaml.load(text).builds);
  return catalogueBuilds;
}

export default Index;
