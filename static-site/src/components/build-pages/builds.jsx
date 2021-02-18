import React from "react";
import { FaChartArea } from "react-icons/fa";
import Collapsible from "react-collapsible";
import { orderBy } from "lodash";
import { FlexGridLeft } from "../../layouts/generalComponents";
import * as splashStyles from "../splash/styles";
import CollapseTitle from "../Misc/collapse-title";

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
    this.subBuilds = this.subBuilds.bind(this);
    this.displayChildren = this.displayChildren.bind(this);
  }

  displayChildren(children, variables) {
    if (!variables) {
      return (
        <FlexGridLeft style={{marginBottom: "10px"}}>
          {children.map((child) => (
            <div key={child.url}>
              {buildComponent(child)}
            </div>
          ))}
        </FlexGridLeft>);
    }
    const firstVariableTypes = Array.from(new Set(children.map((c) => c.variable1)));
    const secondVariableTypes = variables === 2 ? Array.from(new Set(children.map((c) => c.variable2))) : undefined;
    // Rows are array of arrays nesting according to variable values
    const rows = firstVariableTypes.map((v1) => {
      let row = children.filter((c) => c.variable1 === v1);
      if (secondVariableTypes) {
        row = secondVariableTypes.map((v2) => row.filter((c) => c.variable2 === v2));
      }
      return row;
    });
    return (<div style={{paddingLeft: "20px", overflow: "auto"}}><table>
      {/* Column header for second variable. Not needed if only one variable since will only be one entry per row-column */}
      {secondVariableTypes && <tr><th/>{secondVariableTypes.map((secondVariable) => (
        <th key={secondVariable}>
          <splashStyles.H4>{secondVariable}</splashStyles.H4>
        </th>))}
      </tr>}
      {rows.map((rowEntries, idx) => (
        <tr key={`${firstVariableTypes[idx]}-row`}>
          {/* Row header */}
          <td key={`${firstVariableTypes[idx]}-header`}><splashStyles.H4>{firstVariableTypes[idx]}</splashStyles.H4></td>
          {/* Row entries */}
          {secondVariableTypes ?
            rowEntries.map((entriesList, idx2) => <td key={`${secondVariableTypes[idx2]}-entries`}>{entriesList.map(buildComponent)}</td>)
            :
            rowEntries.map((entry) => <td key={entry.name}>{buildComponent(entry)}</td>)
          }
        </tr>))}
    </table></div>);
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
            {children.length > 0 && this.displayChildren(children, header.variables)}
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
