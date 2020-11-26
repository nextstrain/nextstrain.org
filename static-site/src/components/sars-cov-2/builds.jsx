import React from "react";
import { FaChartArea } from "react-icons/fa";
import Collapsible from "react-collapsible";
import { orderBy } from "lodash";
import { SmallSpacer, MediumSpacer, HugeSpacer } from "../../layouts/generalComponents";
import * as splashStyles from "../splash/styles";
import allSARSCoV2Builds from "../../../content/allSARS-CoV-2Builds.yaml";
import CollapseTitle from "../Misc/collapse-title";

/*
* This is a page to display all builds for SARS-CoV-2 in one place.
* TODO:
* - abstract 15px left margin
* - tweak yaml design for builds list as necessary
*/

const buildComponent = (build) => (
  <splashStyles.SitRepTitle >
    {build.url === null ? build.name : <div>
      <a href={build.url}>
        <FaChartArea />
        {` ${build.name} `}
      </a>
      (
      {build.org.url === null ? build.org.name : <a href={build.org.url}>{build.org.name}</a>
      }
      )
    </div>}
  </splashStyles.SitRepTitle>
);

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false};
    this.buildsForGeo = this.buildsForGeo.bind(this);
    this.subBuilds = this.subBuilds.bind(this);
    this.buildTree = this.buildTree.bind(this);
  }

  subBuilds(header, expanded=false, fontSize=20) {
    const children = allSARSCoV2Builds.builds
      .filter((b) => b.geo === header.geo && b.url !== null);
    const subHeaders = allSARSCoV2Builds.builds
      .filter((b) => b.parentGeo === header.geo && b.url === null);
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
            <div className="row">
              {children.length > 0 && children.map((child) => (
                <div className="col-sm-4">
                  {buildComponent(child)}
                </div>
              ))}
            </div>
            <div style={{marginLeft: "20px"}}>
              {subHeaders.length > 0 && orderBy(subHeaders, ["name"]).map((subHeader) =>
                this.subBuilds(subHeader,
                  subHeaders.length < 5,
                  fontSize > 16 ? fontSize-2 : fontSize))}
            </div>
          </div>
        </Collapsible>
      </div>);
  }

  buildTree() {
    const headers = allSARSCoV2Builds.builds.filter((b) => b.url === null);
    const roots = headers.filter((b) => b.parentGeo === null);
    return roots.map((root) => this.subBuilds(root));
  }

  buildsForGeo(geo) {
    return allSARSCoV2Builds.builds
    .filter((b) => b.geo === geo)
    .map((build) => buildComponent(build));
  }

  render() {
    return (
      <>
        <HugeSpacer /><HugeSpacer />
        <splashStyles.H2 left>
          All SARS-CoV-2 Builds
        </splashStyles.H2>
        <SmallSpacer />
        <splashStyles.FocusParagraph>
          This section is an index of public Nextstrain builds (datasets) for SARS-CoV-2, organized by geography.
          Some of these builds are maintained by the nextstrain team and others are maintained by independent research groups.
          (<a href="https://docs.nextstrain.org/projects/augur/en/stable/faq/what-is-a-build.html" >See here</a> for more information on what a build is, and see <a href="https://nextstrain.github.io/ncov/">this tutorial</a> for a walkthrough of running your own phylogenetic analysis of SARS-CoV-2 data!)
          If you know of a build not listed here, please let us know!
          Please note that inclusion on this list does not indicate an endorsement by the Nextstrain team.
        </splashStyles.FocusParagraph>
        <div className="row">
          <MediumSpacer />
          <div className="col-md-1"/>
          <div className="col-md-10">
            { this.state.hasError && <splashStyles.CenteredFocusParagraph>
                            Something went wrong getting data.
                            Please <a href="mailto:hello@nextstrain.org">contact us at hello@nextstrain.org </a>
                            if this continues to happen.</splashStyles.CenteredFocusParagraph>}
            {this.buildTree()}
          </div>
        </div>
      </>
    );
  }
}

export default Index;
