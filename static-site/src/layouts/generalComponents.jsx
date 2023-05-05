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

export const FlexGridLeft = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

export const FlexGridRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex-wrap: wrap;
`

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

export const CenteredContainer = (props) => (
  <div className="row">
    <div className="col-md-2" />
    <div className="col-md-8">
      {props.children}
    </div>
    <div className="col-md-2" />
  </div>
);

export const MarkdownContent = styled.div`
  justify-self: center;
  width: 100%;
  font-size: 16px;
  font-weight: 300;
  margin-top: 0px;
  padding-bottom: 25px;
  color: ${(props) => props.theme.darkGrey};
  line-height: ${(props) => props.theme.niceLineHeight};

  & > h1 {
    color: ${(props) => props.theme.accentDark};
  }
  li > ul {
    padding-left: 30px;
    margin: 5px 0px 5px 0px;
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
  blockquote {
    margin-top: 15px;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #ccc;
  }
`;

