import React from "react";
import Helmet from "react-helmet";
import Select, {createFilter} from 'react-select';
import styled from 'styled-components';
import {FaFile} from "react-icons/fa";
import config from "../../data/SiteConfig";
import NavBar from '../components/nav-bar';
import MainLayout from "../components/layout";
import UserDataWrapper from "../layouts/userDataWrapper";
import { SmallSpacer, MediumSpacer, HugeSpacer, FlexCenter } from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import Footer from "../components/Footer";
import {datasets, strainMap} from "../../../data/ncov-strains-to-datasets.json";


/**
 * See https://github.com/JedWatson/react-select/issues/3128 for ways to speed up <Select>
 */

const selectableStrains = Object.keys(strainMap).map((s) => ({value: strainMap[s], label: s})); // .filter((_, i) => i<10);

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
                Search nCoV datasets by sample name
              </splashStyles.H2>
              <SmallSpacer />
              <FlexCenter>
                <splashStyles.CenteredFocusParagraph theme={{niceFontSize: "14px"}}>
                  This is a prototype of how we can find which datasets a particular sample appears in.
                  Limitations: currently it scans the datasets in the staging bucket and the scan is only done
                  when the server starts up.
                </splashStyles.CenteredFocusParagraph>
              </FlexCenter>
              <div className="row">
                <MediumSpacer />
                <div className="col-md-1"/>
                <div className="col-md-10">
                  <HugeSpacer/>
                  <Select
                    options={selectableStrains}
                    openMenuOnClick={false}
                    filterOption={createFilter({ignoreAccents: false})}
                    isClearable
                    isMulti
                    onChange={this.onSelectChange}
                  />
                  <HugeSpacer/>
                  <DatasetsWithSequence selected={this.state.selected}/>
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

const Ul = styled.ul`
  font-size: 16px;
  line-height: 1.7;
  list-style: none;
`;

function DatasetsWithSequence({selected}) {
  if (!selected || !selected.length) return null;
  if (selected.length === 1) {
    return (
      <div>
        <h3>{`Sample "${selected[0].label}" appears in ${selected[0].value.length} datasets`}</h3>
        <Ul>
          {selected[0].value.map((datasetIdx) => {
            const d = datasets[datasetIdx];
            return (
              <li key={d.filename}><a href={d.url}><FaFile />{" "+d.filename.replace(".json", "").replace("_", " / ")}</a>{` (last modified ${d.lastModified})`}</li>
            );
          })}
        </Ul>
      </div>
    );
  }
  // else we want to find datsets which have all strains
  const datasetIndicies = selected.map((s) => s.value);
  const intersectedIndicies = datasetIndicies.reduce((a, b) => a.filter(c => b.includes(c)));
  return (
    <div>
      <h3>{`The ${selected.length} samples appear (together) in ${intersectedIndicies.length} datasets`}</h3>
      <h4>{selected.map((s) => s.label).join(", ")}</h4>
      <Ul>
        {intersectedIndicies.map((datasetIdx) => {
          const d = datasets[datasetIdx];
          return (
            <li key={d.filename}><a href={d.url}><FaFile />{" "+d.filename.replace(".json", "").replace("_", " / ")}</a>{` (last modified ${d.lastModified})`}</li>
          );
        })}
      </Ul>
    </div>
  );
}


export default SequencesToDatasets;

