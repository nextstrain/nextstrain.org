import React from "react";
import "react-select/dist/react-select.css";
import "react-virtualized-select/styles.css";
import { get } from 'lodash';
import styled from 'styled-components';
import { MdPerson } from "react-icons/md";
import {Grid, Col, Row} from 'react-styled-flexboxgrid';

const logoPNG = require("../../../static/logos/favicon.png");

const StyledLinkContainer = styled.div`
  a {
    color: #444;
    font-weight: ${(props) => props.bold ? 700 : "normal"};
  }
  a:hover,
  a:focus {
    color: #5097BA;
    text-decoration: underline;
  }
`;

const StyledIconLinkContainer = styled.div`
  svg {
    color: #444;
  }
  svg:hover,
  svg:focus {
    color: #5097BA;
  }
`;

const DatasetSelectionResultsContainer = styled.div`
  height: 600px;
  overflow-x: hidden;
  overflow-y: visible;
`;

const DatasetContainer = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 900;
  font-size: 18px;
  padding: 10px 1px 10px 1px;
  line-height: 24px;
`;

const LogoContainer = styled.a`
  padding: 1px 1px;
  margin-right: 5px;
  width: 24px;
  cursor: pointer;
`;

export const ListDatasets = ({datasets, showDates}) => {
  return (
    <>
      <Grid fluid>
        <DatasetContainer key="Column labels" style={{borderBottom: "1px solid #CCC"}}>
          <Row>
            <Col xs={8} sm={6} md={7}>
              Dataset
            </Col>
            <Col xs={false} sm={3} md={3}>
              Contributor
            </Col>
            {showDates && <Col xs={false} sm={3} md={2}>
              Uploaded date
            </Col>}
            <Col xs={4} sm={false} style={{textAlign: "right"}}>
              Contributor
            </Col>
          </Row>
        </DatasetContainer>
        <DatasetSelectionResultsContainer>
          { datasets.map((dataset) => (
            <DatasetContainer key={dataset.filename}>
              <Row>
                <Col xs={10} sm={6} md={7}>
                  <StyledLinkContainer bold>
                    <a href={dataset.url}>{dataset.filename.replace(/_/g, ' / ').replace('.json', '')}</a>
                  </StyledLinkContainer>
                </Col>
                <Col xs={false} sm={3} md={3}>
                  <span>
                    {dataset.contributor.includes("Nextstrain") && <LogoContainer href="https://nextstrain.org">
                      <img alt="nextstrain.org" className="logo" width="24px" src={logoPNG}/>
                    </LogoContainer>}
                    {dataset.contributorUrl === undefined ?
                      dataset.contributor :
                      <StyledLinkContainer>
                        <a href={dataset.contributorUrl}>{dataset.contributor}</a>
                      </StyledLinkContainer>}
                  </span>
                </Col>
                {showDates && <Col xs={false} sm={3} md={2}>
                  {dataset.date_uploaded}
                </Col>}
                <Col xs={2} sm={false} style={{textAlign: "right"}}>
                  <LogoContainer href={dataset.contributor.includes("Nextstrain") ? "https://nextstrain.org" : get(dataset, "contributorUrl")}>
                    {dataset.contributor.includes("Nextstrain") ?
                      <img alt="nextstrain.org" className="logo" width="24px" src={logoPNG}/> :
                      <StyledIconLinkContainer><MdPerson/></StyledIconLinkContainer>
                    }
                  </LogoContainer>
                </Col>
              </Row>
            </DatasetContainer>
          ))
          }
        </DatasetSelectionResultsContainer>
      </Grid>
    </>
  );
};
