import React from "react";
import "react-select/dist/react-select.css";
import "react-virtualized-select/styles.css";
import styled from 'styled-components';
import {Grid, Col, Row} from 'react-styled-flexboxgrid';
import { CenteredContainer } from "./styles";

const StyledLink = styled.a`
  color: #444 !important;
  font-weight: ${(props) => props.bold ? 500 : 300} !important;
  &:hover,
  &:focus {
    color: #5097BA !important;
    text-decoration: underline;
  }
`;

const DatasetSelectionResultsContainer = styled.div`
  height: 600px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const RowContainer = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 900;
  font-size: 18px;
  padding: 10px 1px 10px 1px;
  line-height: 24px;
  ${(props) => props.border && `border-bottom: 1px solid #CCC;`}
`;

const LogoContainerLink = styled.a`
  padding: 1px 1px;
  margin-right: 5px;
  width: 24px;
  cursor: pointer;
`;

const LogoContainer = styled.span`
  padding: 1px 1px;
  margin-right: 5px;
  width: 24px;
`;

const columnStyles = [
  [{xs: 8, sm: 6, md: 7}], // column 1 rendered as a single <Col>
  [{xs: false, sm: 3, md: 3}, {xs: 4, sm: false, style: {textAlign: 'right'}}], // column 2
  [{xs: false, sm: 3, md: 2}]
];

const HeaderRow = ({columns}) => {
  const names = columns.map((c) => c.name);
  return (
    <RowContainer>
      <Row>
        {/* column 1 (typically the dataset) - same rendering on main & mobile views */}
        <Col {...columnStyles[0][0]} key={names[0]}>{names[0]}</Col>

        {/* column 2: (typically the contributor) - both main & mobile views */}
        {names.length>=2 && (
          <>
            <Col {...columnStyles[1][0]} key={names[1]}>{names[1]}</Col>
            <Col {...columnStyles[1][1]} key={`${names[1]}-mobile`}>{names[1]}</Col>
          </>
        )}

        {/* column 3: optional. Not rendered on small screens. */}
        {names.length===3 && (
          <Col {...columnStyles[2][0]} key={names[2]}>{names[2]}</Col>
        )}
      </Row>
    </RowContainer>
  );
};

const NormalRow = ({columns, dataset}) => {
  const names = columns.map((c) => c.name);
  return (
    <RowContainer>
      <Row>
        {/* column 1 (typically the dataset) - same rendering on main & mobile views */}
        <Col {...columnStyles[0][0]} key={names[0]}>
          <Value dataset={dataset} columnInfo={columns[0]} firstColumn/>
        </Col>

        {/* column 2: (typically the contributor) - both main & mobile views */}
        {names.length>=2 && (
          <>
            <Col {...columnStyles[1][0]} key={names[1]}>
              <Value dataset={dataset} columnInfo={columns[1]}/>
            </Col>
            <Col {...columnStyles[1][1]} key={`${names[1]}-mobile`}>
              <Value dataset={dataset} columnInfo={columns[1]} mobileView/>
            </Col>
          </>
        )}

        {/* column 3: optional. Not rendered on small screens. */}
        {names.length===3 && (
          <Col {...columnStyles[2][0]} key={names[2]}>
            <Value dataset={dataset} columnInfo={columns[2]} mobileView/>
          </Col>
        )}
      </Row>
    </RowContainer>
  );
};

/**
 * Render the value for a particular cell in the table.
 * May be a link and/or have a logo, depending on the data in `columnInfo`
 */
const Value = ({dataset, columnInfo, mobileView, firstColumn}) => {
  const url = typeof columnInfo.url === "function" && columnInfo.url(dataset);
  const value = mobileView && typeof columnInfo.valueMobile === "function" ?
    columnInfo.valueMobile(dataset) :
    columnInfo.value(dataset);
  const logo = mobileView && typeof columnInfo.logoMobile === "function" ?
    columnInfo.logoMobile(dataset) :
    typeof columnInfo.logo === "function" ?
      columnInfo.logo(dataset) :
      undefined;
  return (
    <>
      {(logo && url) ?
        (<LogoContainerLink href={url}>{logo}</LogoContainerLink>) :
        logo ?
          (<LogoContainer>{logo}</LogoContainer>) :
          null
      }
      {url ?
        <StyledLink bold={firstColumn} href={url}>{value}</StyledLink> :
        value
      }
    </>
  );
};


/**
 * React component to render a table showing the `datasets` as rows with
 * the specified `columns`. Open to future expansion.
 * Currently only 2 or 3 columns are supported.
 * If 3 columns are supplied, the 3rd will not be shown on small screens.
 * @prop {Array} columns Array of columns. Each entry is an object with following properties:
 *       `name` {string} To be displayed in the header
 *       `value` {function} return the value, given an individual entry from `datasets`
 *       `valueMobile` {function | undefined} value to be used on small screens
 *       `url` {function | undefined} render the value as a link to this URL
 *       `logo` {function | undefined} if the function returns "nextstrain" then we render the Nextstrain logo.
 * @returns React Component
 */
export const ListDatasets = ({datasets, columns}) => {
  return (
    <CenteredContainer>
      <Grid fluid>
        <HeaderRow columns={columns}/>
        <DatasetSelectionResultsContainer>
          {datasets.map((dataset) => (
            <NormalRow dataset={dataset} columns={columns} key={columns[0].value(dataset)}/>
          ))}
        </DatasetSelectionResultsContainer>
      </Grid>
    </CenteredContainer>
  );
};
