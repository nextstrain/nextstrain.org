import React from "react";
import PropTypes from "prop-types";
import styled, {css} from "styled-components";
import {theme} from "../../layouts/theme";

// eslint-disable-next-line react/prefer-stateless-function
class Card extends React.Component {
  calcDim() {
    /* more experimentation needed with different screen sizes here */
    if (this.props.parentWidth > 500) {
      return 200;
    }
    return 140; // minimum card size
  }
  render() {
    if (!this.props.parentWidth) return null;
    const color = theme.rainbow10[this.props.cardIdx%theme.rainbow10.length];
    const dim = this.calcDim();
    return (
      <Container dim={dim}>
        <a href={this.props.url}>
          {this.props.img ?
            <CardImg src={require(`../../../static/splash_images/${this.props.img}`)} as={this.props.title}/> : // eslint-disable-line
            <CardSwatch color={color}/>
          }
          <CardTitle availWidth={dim}>{this.props.title}</CardTitle>
          {this.props.private && <Padlock availWidth={dim}/>}
        </a>
      </Container>
    );
  }
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  img: PropTypes.string,
  private: PropTypes.bool,
  cardIdx: PropTypes.number.isRequired,
  parentWidth: PropTypes.number.isRequired,
};

export default Card;

const Container = styled.div`
  position: relative; // needed for children using absolute
  overflow: hidden;
  min-width: ${(props) => props.dim}px;
  max-width: ${(props) => props.dim}px;
  min-height: ${(props) => props.dim}px;
  max-height: ${(props) => props.dim}px;
  padding: 6px;
`;

const commonCardCss = css`
  border-radius: 6px;
  box-shadow: 3px 3px 3px 1px rgba(0, 0, 0, 0.15);
  min-height: 100%;
  max-height: 100%;
  min-width: 100%;
  max-width: 100%;
`;
const CardSwatch = styled.div`
  ${commonCardCss}
  background-color: ${(props) => props.color};
`;
const CardImg = styled.img`
  ${commonCardCss}
`;

const overlayStyles = css`
  position: absolute;
  border-radius: ${(props) => props.availWidth<200 ? "3px" : "6px"}; 
  padding: ${(props) => props.availWidth<200 ? "3px 5px" : "6px 12px"}; 
  right: ${(props) => props.availWidth<200 ? "5px" : "12px"}; 
  background: rgba(0, 0, 0, 0.7);
`;
const CardTitle = styled.div`
  ${overlayStyles}
  top: ${(props) => props.availWidth<200 ? "20px" : "40px"};
  max-width: ${(props) => props.availWidth - (props.availWidth<200 ? 20 : 40)}px;
  font-family: ${(props) => props.theme.generalFont};
  font-weight: ${(props) => props.availWidth<200 ? 300 : 500};
  font-size: ${(props) => props.availWidth<200 ? '14px' : '24px'};
  color: white;
`;
const PadlockContainer = styled.div`
  ${overlayStyles}
  bottom: ${(props) => props.availWidth<200 ? "10px" : "30px"};
`;
const Padlock = ({availWidth}) => (
  <PadlockContainer availWidth={availWidth}>
    <svg stroke="white" fill="white" width="16" height="19">
      <path
        fillRule="evenodd"
        d="M4 13H3v-1h1v1zm8-6v7c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h1V4c0-2.2 1.8-4 4-4s4 1.8 4 4v2h1c.55 0 1 .45 1 1zM3.8 6h4.41V4c0-1.22-.98-2.2-2.2-2.2-1.22 0-2.2.98-2.2 2.2v2H3.8zM11 7H2v7h9V7zM4 8H3v1h1V8zm0 2H3v1h1v-1z"
      />
    </svg>
  </PadlockContainer>
);

