import styled from "styled-components";
import React from "react";
import {PanelButtons} from "../panels/panelStyles";

const Blurb = ({title, buttons, children}) => (
  <OuterContainer>
    <InnerContainer>
      {title && (<Title>{title}</Title>)}
      {children}
      {buttons && (
        <div style={{paddingTop: "15px"}}>
          <PanelButtons buttons={buttons}/>
        </div>
      )}
    </InnerContainer>
  </OuterContainer>
);

export default Blurb;

const OuterContainer = styled.div`
  min-width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 50px;
  @media (max-width: ${(props) => props.theme.mobileThreshold}) {
    margin-bottom: 30px;
  }
  border: 1px solid #c994c7;
`;

const InnerContainer = styled.div`
  max-width: 80%;
  margin: 0px auto;
  text-align: center;
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 300;
  line-height: ${(props) => props.theme.niceLineHeight};
  border: 1px solid #8856a7;
  @media (max-width: ${(props) => props.theme.mobileThreshold}) {
    max-width: 100%;
  }
  li {
    text-align: left;
  }
`;

const Title = styled.div`
  text-align: center;
  font-size: 38px;
  line-height: 50px;
  font-weight: 300;
  font-family: ${(props) => props.theme.generalFont};
  color: ${(props) => props.theme.darkGrey};
  margin: 5px 0px;
  @media (max-width: ${(props) => props.theme.mobileThreshold}) {
    font-size: 32px;
    line-height: 42px;
  }
`;
