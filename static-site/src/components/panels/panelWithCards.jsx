import React from "react";
import styled from "styled-components";
import { debounce } from 'lodash';
import Card from "./card";
import { Panel, PanelTitle, PanelSubtitle, PanelButtons } from "./panelStyles";


class PanelWithCards extends React.Component {
  constructor() {
    super();
    this.state={cardsContainerWidth: 0};
    this.updateDimensions = debounce(() => {
      if (!this.cardsContainerRef) return;
      this.setState({cardsContainerWidth: this.cardsContainerRef.getBoundingClientRect().width});
    }, 100);
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }
  render() {
    return (
      <Panel fullwidth={this.props.fullwidth}>
        {this.props.title && (
          <PanelTitle>{this.props.title}</PanelTitle>
        )}
        {this.props.subtitle && (
          <PanelSubtitle>{this.props.subtitle}</PanelSubtitle>
        )}
        {this.props.cards && (
          <CardsContainer innerRef={(input) => {this.cardsContainerRef = input;}}>
            {/* we use `innerRef` to access the actual DOM node, as `ref` returns the styled component wrapper */}
            {this.props.cards.map((props, cardIdx) =>
              <Card {...props} cardIdx={cardIdx} parentWidth={this.state.cardsContainerWidth} key={props.title}/>
            )}
          </CardsContainer>
        )}
        {this.props.buttons && (<PanelButtons buttons={this.props.buttons}/>)}
      </Panel>
    );
  }
}

export default PanelWithCards;


const CardsContainer = styled.div`
  display: flex;
  /* background-color: ; */
  border: 1px solid #ffeda0;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: stretch; // each box in a row will be same height (cross-axis)
  margin: 20px 10px
`;

