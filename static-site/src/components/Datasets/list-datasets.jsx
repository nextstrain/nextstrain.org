import React from "react";
import styled from 'styled-components';
import { CenteredContainer } from "./styles";

const Row = styled.div`
  padding: 10px 1px 10px 1px;
  display: flex;
  flex-direction: row;
`;

export const StyledLink = styled.a`
  color: #444 !important;
  font-weight: ${(props) => props.$bold ? 500 : 300} !important;
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

const SingleColumn = styled.div``;

const Col1 = styled.div`
  flex-basis: 60%;
`;
const Col2 = styled.div`
  flex-basis: 40%;
`;


const HeaderRow = ({columns}) => {
  const names = columns.map((c) => c.name);
  if (columns.length===1) {
    return (
      <Row>
        <SingleColumn>{names[0]}</SingleColumn>
      </Row>
    )
  }
  return (
    <Row>
      <Col1>{names[0]}</Col1>
      <Col2>{names[1]}</Col2>
    </Row>
  )
}

const NormalRow = ({columns, dataset}) => {
  if (columns.length===1) {
    return (
      <Row>
        <SingleColumn>
          <Value dataset={dataset} columnInfo={columns[0]} firstColumn/>
        </SingleColumn>
      </Row>
    )
  }
  return (
    <Row>
      <Col1>
        <Value dataset={dataset} columnInfo={columns[0]} firstColumn/>
      </Col1>
      <Col2>
        <Value dataset={dataset} columnInfo={columns[1]}/>
      </Col2>
    </Row>
  )
}

/**
 * Render the value for a particular cell in the table.
 * May be a link and/or have a logo, depending on the data in `columnInfo`
 */
const Value = ({dataset, columnInfo, firstColumn}) => {
  const url = typeof columnInfo.url === "function" && columnInfo.url(dataset);
  const value = columnInfo.value(dataset);
  const logo = typeof columnInfo.logo === "function" ? columnInfo.logo(dataset) : undefined;
  return (
    <>
      {(logo && url) ?
        (<LogoContainerLink href={url}>{logo}</LogoContainerLink>) :
        logo ?
          (<LogoContainer>{logo}</LogoContainer>) :
          null
      }
      {url ?
        <StyledLink $bold={firstColumn} href={url}>{value}</StyledLink> :
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
 *       `url` {function | undefined} render the value as a link to this URL
 *       `logo` {function | undefined} if the function returns "nextstrain" then we render the Nextstrain logo.
 * @returns React Component
 */
export const ListDatasets = ({datasets, columns}) => {
  return (
    <CenteredContainer>
      <RowContainer>
        <HeaderRow columns={columns}/>
        <DatasetSelectionResultsContainer>
          {datasets.map((dataset) => (
            <NormalRow dataset={dataset} columns={columns} key={columns[0].value(dataset)}/>
          ))}
        </DatasetSelectionResultsContainer>
      </RowContainer>
    </CenteredContainer>
  );
};
