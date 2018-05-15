import React from "react";
import styled from "styled-components";

export const FlexCenter = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  margin: 0px;
  padding: 0px;
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
    <a href={link} style={{fontWeight: 300, color: "#333", marginLeft: "2px", marginRight: "2px"}}>
      <img alt="trevor" width="30"
        style={{marginLeft: "4px", marginRight: "3px", borderRadius: "50%", verticalAlign: "middle"}}
        src={require("../../static/team/"+image)}/>
      {name}
    </a>
  </span>
);

export const CenteredContainer = (props) => (
  <div className="row">
    <div className="col-md-2" />
    <div className="col-md-8">
      {props.children}
    </div>
    <div className="col-md-2" />
  </div>
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
  padding: 0px;
  font-size: 16px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: ${props => props.theme.darkGrey};
  line-height: ${props => props.theme.niceLineHeight};

  & > h1 {
    color: ${props => props.theme.accentDark};
  }
`;

export const MarkdownContent = styled.div`
  overflow: scroll;
  justify-self: center;
  width: 100%;
  font-size: 16px;
  font-weight: 300;
  margin-top: 15px;
  color: ${props => props.theme.darkGrey};
  line-height: ${props => props.theme.niceLineHeight};

  & > h1 {
    color: ${props => props.theme.accentDark};
  }
  li > ul {
    padding-left: 30px;
  }
  li {
    margin-left: 30px;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 20px;
  }
  p {
    margin-top: 15px;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #ccc;
  }
`;

const Aside = styled.div`
  font-size: 13px;
`
