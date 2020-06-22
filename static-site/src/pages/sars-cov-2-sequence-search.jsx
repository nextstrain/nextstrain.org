import React from "react";
import Helmet from "react-helmet";
import Select, {createFilter} from 'react-select';
import styled from 'styled-components';
import {FaFile, FaExclamation} from "react-icons/fa";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";

/**
 * See https://github.com/JedWatson/react-select/issues/3128 for ways to speed up <Select>
 */

/* Parse the JSONs created on server-start to produce a list of selectable strains --
those which are either included in a dataset or included in the exclude list. (Or both!).
In the future this could be a file fetch / GraphQL logic and part of the react component.
There are plenty of improvements, but this is the simplest to begin with */
let [selectableStrains, datasets, nSamplesInDatasets, nSamplesInExcludeList, nDatasets, dateUpdated] = [[], [], 0, 0, 0, "unknown"];
try {
  let strainMap;
  ({datasets, strainMap, dateUpdated} = require("../../../data/ncov-strains-to-datasets.json")); // eslint-disable-line
  nDatasets = datasets.length;
  nSamplesInDatasets = Object.keys(strainMap).length;
  const excludeMap = require("../../../data/ncov-excluded-strains.json"); // eslint-disable-line
  nSamplesInExcludeList = Object.keys(excludeMap).length;
  const selectableStrainsDict = {};
  Object.keys(strainMap).forEach((s) => {selectableStrainsDict[s] = {value: {included: strainMap[s]}, label: s};});
  Object.entries(excludeMap).forEach(([strain, reason]) => {
    if (selectableStrainsDict[strain]) {
      selectableStrainsDict[strain].value.excluded = reason;
    } else {
      selectableStrainsDict[strain] = {value: {excluded: reason}, label: strain};
    }
  });
  selectableStrains = Object.values(selectableStrainsDict)
    .sort((a, b) => a.label.localeCompare(b.label)); // sort dropdown entries alphabetically
} catch (err) {
  console.error("Error fetching / parsing data.", err.message);
}


const Ul = styled.ul`
  font-size: 16px;
  line-height: 1.7;
  list-style: none;
`;

const Excluded = styled.div`
  font-size: 18px;
  color: red;
`;

class SequencesToDatasets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: []};
    this.onSelectChange = this.onSelectChange.bind(this);
  }
  onSelectChange(inputValue, { action }) {
    // see https://react-select.com/advanced
    // console.log(inputValue, action);
    switch (action) {
      case 'select-option': // fallthrough
      case 'remove-value':
        this.setState({ selected: inputValue });
        break;
      case 'clear':
        this.setState({ selected: [] });
        break;
      default:
        console.error("Unhandled <Select> event", action);
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
              <HugeSpacer />
              <splashStyles.H2>
                Search SARS-CoV-2 datasets by sample name
              </splashStyles.H2>
              <SmallSpacer />
              <FlexCenter>
                <splashStyles.CenteredFocusParagraph theme={{niceFontSize: "14px"}}>
                  If you know the name(s) of sequences, you can search here to find out which datasets, if any,
                  the samples appear in. If you select multiple samples, then only datasets where they all appear
                  will be shown. Additionally, if we have deliberately excluded a sample from the analysis we will attempt
                  to show the reason here.
                  <br/><br/>
                  Current database: {nSamplesInDatasets} samples, from {nDatasets} datasets on the core nextstrain bucket.
                  <br/>
                  Additionally, {nSamplesInExcludeList} samples from our manually curated exclusion list are included.
                  <br/>
                  Data updated: {dateUpdated}
                </splashStyles.CenteredFocusParagraph>
              </FlexCenter>
              <div className="row">
                <MediumSpacer />
                <div className="col-md-1"/>
                <div className="col-md-10">
                  {(nSamplesInDatasets===0 || nSamplesInExcludeList===0) && (
                    <Excluded>There appears to have been a problem fetching the data for this page. Results, if any, may be incorrect!</Excluded>
                  )}
                  <HugeSpacer/>
                  <Select
                    options={selectableStrains}
                    openMenuOnClick={false}
                    getOptionValue={(option) => option.label}
                    filterOption={createFilter({ignoreAccents: false})}
                    isClearable
                    isMulti
                    onChange={this.onSelectChange}
                  />
                  <HugeSpacer/>
                  <InfoAboutSequence selected={this.state.selected}/>
                </div>
              </div>

              <Footer />

            </splashStyles.Container>
          </main>
        </div>
      </MainLayout>
    );
  }
}

function InfoAboutSequence({selected}) {
  if (!selected || !selected.length) return null;

  // Calculate the datasets where _all_ the selected strains are in.
  const datasetIndicies = selected.map((s) => s.value.included || [])
    .reduce((a, b) => a.filter(c => b.includes(c)));


  return (
    <>
      {selected.length === 1 ? (
        <h3>{`Sample "${selected[0].label}" appears in ${datasetIndicies.length} datasets`}</h3>
      ) : (
        <h3>{`The ${selected.length} selected samples appear, together, in ${datasetIndicies.length} datasets`}</h3>
      )}
      <ListMatchingDatasets datasetIndicies={datasetIndicies}/>
      <MediumSpacer/>
      {selected.map((s) => (
        s.value.excluded ? (
          <Excluded key={s.label}>
            <h3><FaExclamation/>{`Sample ${s.label} is excluded from current builds`}</h3>
            {`reason: ${s.value.excluded}`}
          </Excluded>
        ) : null))}
    </>
  );

}

function ListMatchingDatasets({datasetIndicies}) {
  if (!datasetIndicies || (Array.isArray(datasetIndicies) && !datasetIndicies.length)) return null;
  return (
    <Ul>
      {datasetIndicies.map((datasetIdx) => {
        const d = datasets[datasetIdx];
        return (
          <li key={d.filename}>
            <a href={d.url}>
              <FaFile />
              {" "+d.filename.replace(".json", "").replace("_", " / ")}
            </a>
            {` (last modified ${d.lastModified})`}
          </li>
        );
      })}
    </Ul>
  );
}


export default SequencesToDatasets;
