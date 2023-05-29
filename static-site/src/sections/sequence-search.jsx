import React from "react";
import Select, {createFilter} from 'react-select';
import styled from 'styled-components';
import {FaFile, FaExclamation} from "react-icons/fa";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import { DataFetchErrorParagraph } from "../components/splash/errorMessages";

/**
 * See https://github.com/JedWatson/react-select/issues/3128 for ways to speed up <Select>
 */

const Ul = styled.ul`
  font-size: 16px;
  line-height: 1.7;
  list-style: none;
`;

const LargeRedSection = styled.div`
  font-size: 18px;
  color: red;
`;

class SequencesToDatasets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      errorFetchingData: false,
      selected: [], // currently selected strains (via user interaction)
      displayName: props.pageContext.displayName,
      jsonUrl: props.pageContext.jsonUrl,
      selectableStrains: [], // array of searchable strains for react-select dropdown
      datasets: [], // array of information about individual datasets
      nSamplesInDatasets: 0,
      nSamplesInExcludeList: 0,
      nDatasets: 0,
      dateUpdated: "unknown"
    };
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

  async componentDidMount() {
    try {
      const {selectableStrains, datasets, nSamplesInDatasets, nSamplesInExcludeList, nDatasets, dateUpdated} =
        await fetchAndParseJson(this.state.jsonUrl);
      this.setState({selectableStrains, datasets, nSamplesInDatasets, nSamplesInExcludeList, nDatasets, dateUpdated, dataLoaded: true});
    } catch (err) {
      console.error("Error fetching / parsing data.", err.message);
      this.setState({errorFetchingData: true});
    }
  }

  render() {
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H2>
                Search {this.state.displayName} datasets by sample name
        </splashStyles.H2>
        <SmallSpacer />
        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>

            <strong style={{color: 'red', paddingBottom: '20px'}}>
              This functionality is no longer being maintained, but we hope to revisit this in the future. 
              {` Please `}
              <a href={"mailto:hello@nextstrain.org"} style={{color: "inherit", textDecoration: "underline"}}>
                get in touch
              </a>
              {` if you were relying on this functionality and we'll see if we can help.`}
            </strong>
            <p/>
                  If you know the name(s) of sequences, you can search here to find out which datasets, if any,
                  the samples appear in. If you select multiple samples, then only datasets where they all appear
                  will be shown. Additionally, if we have deliberately excluded a sample from the analysis we will attempt
                  to show the reason here.
            {this.state.dataLoaded && (
              <>
                <br/><br/>
                      Current database: {this.state.nSamplesInDatasets} samples, from {this.state.nDatasets} datasets on the core nextstrain bucket.
                {this.state.nSamplesInExcludeList!==0 && (
                  <>
                    <br/><br/>
                          Additionally, {this.state.nSamplesInExcludeList} samples from our manually curated exclusion list are included.
                  </>
                )}
                <br/><br/>
                      Data updated: {this.state.dateUpdated}
              </>
            )}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <div className="row">
          <MediumSpacer />
          <div className="col-md-1"/>
          <div className="col-md-10">
            {this.state.errorFetchingData && (
              <LargeRedSection>
                <FlexCenter>
                  <DataFetchErrorParagraph />
                </FlexCenter>
              </LargeRedSection>
            )}
            <HugeSpacer/>
            {this.state.dataLoaded && (
              <Select
                options={this.state.selectableStrains}
                openMenuOnClick={false}
                getOptionValue={(option) => option.label}
                filterOption={createFilter({ignoreAccents: false})}
                isClearable
                isMulti
                onChange={this.onSelectChange}
              />
            )}
            {!this.state.dataLoaded && !this.state.errorFetchingData && (
              <splashStyles.CenteredFocusParagraph theme={{niceFontSize: "22px"}}>
                      Data loading...
              </splashStyles.CenteredFocusParagraph>
            )}
            <HugeSpacer/>
            <InfoAboutSequence datasets={this.state.datasets} selected={this.state.selected}/>
          </div>
        </div>

      </GenericPage>
    );
  }
}

function InfoAboutSequence({datasets, selected}) {
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
      <ListMatchingDatasets
        datasets={datasets}
        datasetIndicies={datasetIndicies}
        focalStrain={selected.length===1 ? selected[0].label : false}
      />
      <MediumSpacer/>
      {selected.map((s) => (
        s.value.excluded ? (
          <LargeRedSection key={s.label}>
            <h3><FaExclamation/>{`Sample ${s.label} is excluded from current builds`}</h3>
            {`reason: ${s.value.excluded}`}
          </LargeRedSection>
        ) : null))}
    </>
  );

}

function ListMatchingDatasets({datasets, datasetIndicies, focalStrain}) {
  if (!datasetIndicies || (Array.isArray(datasetIndicies) && !datasetIndicies.length)) return null;
  return (
    <Ul>
      {datasetIndicies.map((datasetIdx) => {
        const d = datasets[datasetIdx];
        return (
          <li key={d.filename}>
            <a href={focalStrain ? `${d.url}?s=${focalStrain}` : d.url}>
              <FaFile />
              {" "+d.filename.replace(".json", "").replace(/_/g, " / ")}
            </a>
            {` (last modified ${d.lastModified})`}
          </li>
        );
      })}
    </Ul>
  );
}

/* Parse the JSONs created on server-start to produce a list of selectable strains --
those which are either included in a dataset or included in the exclude list. (Or both!).
In the future this could be a file fetch / GraphQL logic and part of the react component.
There are plenty of improvements, but this is the simplest to begin with */
async function fetchAndParseJson(jsonUrl) {
  const {datasets, strainMap, dateUpdated, exclusions} = await fetch(jsonUrl).then((res) => res.json());
  const nDatasets = datasets.length;
  const nSamplesInDatasets = Object.keys(strainMap).length;
  let nSamplesInExcludeList = 0;
  const selectableStrainsDict = {};
  Object.keys(strainMap).forEach((s) => {selectableStrainsDict[s] = {value: {included: strainMap[s]}, label: s};});
  // it's optional for a JSON to specify any exclusions
  if (exclusions) {
    nSamplesInExcludeList = Object.keys(exclusions).length;
    Object.entries(exclusions).forEach(([strain, reason]) => {
      if (selectableStrainsDict[strain]) {
        selectableStrainsDict[strain].value.excluded = reason;
      } else {
        selectableStrainsDict[strain] = {value: {excluded: reason}, label: strain};
      }
    });
  }
  const selectableStrains = Object.values(selectableStrainsDict)
    .sort((a, b) => a.label.localeCompare(b.label)); // sort dropdown entries alphabetically
  return {selectableStrains, datasets, nSamplesInDatasets, nSamplesInExcludeList, nDatasets, dateUpdated};
}

export default SequencesToDatasets;
