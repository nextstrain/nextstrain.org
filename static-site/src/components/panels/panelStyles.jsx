/** Common styles imported by different panels */
import styled from "styled-components";
import React from "react";

export const PanelContainer = styled.div`
  display: flex;
  /* background-color: #80c7cd; */
  border: 1px solid #80c7cd;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: stretch; // each box in a row will be same height (cross-axis)
  @media (max-width: ${(props) => props.theme.mobileThreshold}) {
    flex-direction: column;
    align-content: center;
  }
`;


export const Panel = styled.div`
  flex-grow: 1; // all same size
  flex-shrink: 1;
  min-width: ${(props) => props.fullwidth ? '100%' : '300px'};
  max-width: ${(props) => props.fullwidth ? '100%' : '33%'}; // default for _huge_ screens is 3 columns
  @media (max-width: ${(props) => props.theme.bigScreenThreshold}) {
    max-width: ${(props) => props.fullwidth ? '100%' : '48%'}; // essentially two columns maximum. Not 50% to allow some margin.
  }
  @media (max-width: ${(props) => props.theme.mobileThreshold}) {
    max-width: 100%; // for mobile take up all available width
  }
  min-height: 100%;
  max-height: 100%;
  border: 1px solid #b2efd8; // TODO - dev only
  margin: 0px 0px 10px 0px;
`;


export const PanelTitle = styled.div`
  text-align: center;
  font-size: 2rem;
  font-weight: 400;
  font-family: ${(props) => props.theme.generalFont};
  color: ${(props) => props.theme.darkGrey};
  margin: 5px 0px;
`;

export const PanelSubtitle = styled.div`
  text-align: center;
  font-family: ${(props) => props.theme.generalFont};
  font-size: ${(props) => props.theme.niceFontSize};
  color: ${(props) => props.theme.medGrey};
  margin: 5px 0px;
`;


export const PanelButtons = ({buttons}) => (
  /**
   * Render a row of buttons (often just one).
   * Prop `buttons` is an array of objects, each with properties
   * `to` (href), `label` (rendered text) `external` (optional boolean)
   */
  <ButtonContainer>
    {buttons.map(({to, label, external}) => (
      <a href={to} target={external ? "_blank" : "_self"} rel="noopener noreferrer" key={label}>
        <StyledButton>
          {label}
        </StyledButton>
      </a>
    ))}
  </ButtonContainer>
);

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-evenly;
  @media (max-width: ${(props) => props.theme.mobileThreshold}) {
    flex-direction: column;
    align-items: center;
  }
`;

const StyledButton = styled.button`
  border: 1px solid #CCC;
  background-color: inherit;
  border-radius: 3px;
  cursor: pointer;
  padding: 3px 10px 3px 10px; // between border & text
  margin: 3px; // outside border
  font-size: 1.8rem;
  font-family: ${(props) => props.theme.generalFont};
  color: ${(props) => props.theme.medGrey};
  font-weight: 400;
  text-transform: uppercase;
  vertical-align: middle;
  &:hover {
    color: black;
    border: 1px solid black;
  }
`;