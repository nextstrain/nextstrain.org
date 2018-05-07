import styled from "styled-components";
import Link from 'gatsby-link';
import React from "react";

export const Container = styled.div`
  padding-left: 25px;
  padding-right: 25px;
  display: block;
`;
/* for some reason, this doesn't work (it should)
@media (max-width: 1200px) {
  width: 1150px;
}
*/

export const StyledDiv = styled.div`
  text-align: justify;
  font-size: ${(props) => props.theme.niceFontSize};
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: 300;
  color: ${(props) => props.theme.darkGrey};
  line-height: ${(props) => props.theme.niceLineHeight};
`;

export const H1 = styled.div`
  text-align: center;
  font-size: 38px;
  line-height: 32px;
  font-weight: 300;
  color: ${(props) => props.theme.darkGrey};
  min-width: 240px;
  margin-top: 0px;
  margin-bottom: 0px;
`;

export const CenteredFocusParagraph = styled.p`
  max-width: 600px;
  margin-top: 0px;
  margin-right: auto;
  margin-bottom: 0px;
  margin-left: auto;
  text-align: center;
  font-size: ${(props) => props.theme.niceFontSize};
  font-weight: 300;
  line-height: ${(props) => props.theme.niceLineHeight};
`;


const ButtonContainer = styled.button`
  border: 1px solid #CCC;
  background-color: inherit;
  border-radius: 3px;
  cursor: pointer;
  padding: 5px 10px 5px 10px;
  font-family: ${(props) => props.theme.generalFont};
  color: ${(props) => props.theme.medGrey};
  font-weight: 400;
  text-transform: uppercase;
  font-size: 14;
  vertical-align: middle;
  &:hover {
    color: black;
    border: 1px solid black;
  }
`;

export const CardImg = styled.img`
  object-fit: cover;
  width: 100%;
  border-radius: 6px;
  box-shadow: 3px 3px 3px 1px rgba(0, 0, 0, 0.15);
`;

export const CardInner = styled.div`
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`;

export const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  padding: 15px 0px 15px 0px;
`;

export const CardTitle = styled.div`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: 26px;
  position: absolute;
  border-radius: 3px;
  padding: 10px 20px 10px 20px;
  top: 40px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`;

export class Button extends React.Component {
  render() {
    return (
      <Link style={{border: 'none'}} to={this.props.to}>
        <ButtonContainer>
          {this.props.children}
        </ButtonContainer>
      </Link>
    );
  }
}
