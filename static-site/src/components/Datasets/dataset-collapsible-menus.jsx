import React from "react";
import Collapsible from "react-collapsible";
import { orderBy } from "lodash";
import { FlexGridLeft } from "../../layouts/generalComponents";
import datasetLink from "./dataset-link";
import CollapseTitle from "../Misc/collapse-title";


/*
* This is a page to display a catalogue of datasets for a
* given pathogen. static-site/content/allSARS-CoV-2Datasets.yaml
* is a manually maintained example of such a catalogue, and
* can be used directly here or augmented
* (using scripts/collect-search-results.js) with metadata from
* each dataset and stored in/fetched from props.datasetsUrl
*/
class DatasetCollapsibleMenus extends React.Component {
  constructor(props) {
    super(props);
    this.nestedDatasets = this.nestedDatasets.bind(this);
  }

  nestedDatasets(header, groupingKey, parentGroupingKey, expanded=false, fontSize=20) {
    const children = this.props.catalogueDatasets
      .filter((b) => b[groupingKey] === header[groupingKey] && b.url);
    const subHeaders = this.props.catalogueDatasets
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
                    {datasetLink(child)}
                  </div>
                ))}
              </FlexGridLeft>}
            {subHeaders.length > 0 &&
              <div style={{marginLeft: "20px"}}>
                {orderBy(subHeaders, ["name"]).map((subHeader) =>
                  this.nestedDatasets(subHeader,
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
    const headers = this.props.catalogueDatasets.filter((b) => b.url === undefined);
    const roots = headers.filter((b) => b[parentGroupingKey] === null);
    return (<>{roots.map((root) => this.nestedDatasets(root, groupingKey, parentGroupingKey))}</>);
  }

}

export default DatasetCollapsibleMenus;
