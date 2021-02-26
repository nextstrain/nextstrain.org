import React from "react";
import Collapsible from "react-collapsible";
import { orderBy } from "lodash";
import { FlexGridLeft } from "../../layouts/generalComponents";
import buildLink from "./build-link";
import CollapseTitle from "../Misc/collapse-title";


/*
* This is a page to display a catalogue of builds for a
* given pathogen. static-site/content/allSARS-CoV-2Builds.yaml
* is a manually maintained example of such a catalogue, and
* can be used directly here or augmented
* (using scripts/collect-search-results.js) with metadata from
* each build and stored in/fetched from props.buildsUrl
*/
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.subBuilds = this.subBuilds.bind(this);
  }

  subBuilds(header, groupingKey, parentGroupingKey, expanded=false, fontSize=20) {
    const children = this.props.catalogueBuilds
      .filter((b) => b[groupingKey] === header[groupingKey] && b.url);
    const subHeaders = this.props.catalogueBuilds
      .filter((b) => b[parentGroupingKey] === header[groupingKey] && b.url === undefined);
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
                    {buildLink(child)}
                  </div>
                ))}
              </FlexGridLeft>}
            {subHeaders.length > 0 &&
              <div style={{marginLeft: "20px"}}>
                {orderBy(subHeaders, ["name"]).map((subHeader) =>
                  this.subBuilds(subHeader,
                    groupingKey,
                    parentGroupingKey,
                    subHeaders.length < 5,
                    fontSize > 16 ? fontSize-2 : fontSize))}
              </div>}
          </div>
        </Collapsible>
      </div>);
  }

  render() {
    let groupingKey = "grouping";
    let parentGroupingKey = "parentGrouping";
    if (this.props.hierarchyKeys) ({groupingKey, parentGroupingKey} = this.props.hierarchyKeys);
    const headers = this.props.catalogueBuilds.filter((b) => b.url === undefined);
    const roots = headers.filter((b) => b[parentGroupingKey] === null);
    return (<>{roots.map((root) => this.subBuilds(root, groupingKey, parentGroupingKey))}</>);
  }

}

export default Index;
