import React from "react";
import styled from "styled-components";

export const FlexCenter = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
`;

export const FlexGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
`;

export const SmallSpacer = styled.div`
  height: 5px;
`;

export const MediumSpacer = styled.div`
  height: 10px;
`;

export const BigSpacer = styled.div`
  height: 20px;
`;

export const HugeSpacer = styled.div`
  height: 40px;
`;

export const Line = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #CCC;
`;

export const TeamMember = ({name, image, link}) => (
  <span style={{whiteSpace: "nowrap"}}>
    <a href={link} style={{fontWeight: 300, color: "#333", marginLeft: "3px", marginRight: "3px"}}>
      <img alt="trevor" width="40"
        style={{marginLeft: "4px", marginRight: "4px", borderRadius: "50%", verticalAlign: "middle"}}
        src={require("../../static/team/"+image)}/>
      {name}
    </a>
  </span>
);

export const CenteredContent = (props) => (
  <GeneralNiceText>
    <div className="row">
      <div className="col-md-2" />
      <div className="col-md-8">
        {props.children}
      </div>
      <div className="col-md-2" />
    </div>
  </GeneralNiceText>
);

export const RightHandAside = ({title, asideContent, children}) => (
  <GeneralNiceText className="container">
    <div className="row">
      <div className="col-md-1" />
      <div className="col-md-7">
        <h1>{title}</h1>
      </div>
    </div>
    <div className="row">
      <div className="col-md-1" />
      <div className="col-md-6">
        {children}
      </div>
      <div className="col-md-1" />
      <Aside className="col-md-3 aside">
        {asideContent}
      </Aside>
      <div className="col-md-1" />
    </div>
  </GeneralNiceText>
);

export const GeneralNiceText = styled.div`
  overflow: scroll;
  justify-self: center;
  width: 100%;
  padding: ${props => props.theme.sitePadding};
  text-align: justify;
  font-size: 16px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: ${props => props.theme.darkGrey};
  line-height: ${props => props.theme.niceLineHeight};

  & > h1 {
    color: ${props => props.theme.accentDark};
  }
`

const Aside = styled.div`
  font-size: 13px;
`
