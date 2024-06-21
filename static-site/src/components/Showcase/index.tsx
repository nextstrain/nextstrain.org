/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styled from 'styled-components';
import { CardImg } from "../Cards/styles";
import { Card } from './types';

const cardWidthHeight = 160; // pixels
const expandPreviewHeight = 50 //pixels
const transitionDuration = "0.3s"
const transitionTimingFunction = "ease"

interface ShowcaseProps<AnyCard extends Card> {
    cards: AnyCard[]
    CardComponent: React.FunctionComponent<{ card: AnyCard }>
}

export const Showcase = <AnyCard extends Card>({cards, CardComponent}: ShowcaseProps<AnyCard>) => {

  const [cardsContainerHeight, setCardsContainerHeight] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Function that runs on changes to the container.
   * Used to determine the height upon resize.
   */
  function cardsContainerRef(cardsContainer: HTMLDivElement) {
    if (!cardsContainer) return;

    if(cardsContainerHeight != cardsContainer.clientHeight) {
      setCardsContainerHeight(cardsContainer.clientHeight)
    }
  }

  const isExpandable = cardsContainerHeight > cardWidthHeight;

  return (
    <div>
      <ShowcaseContainer className={!isExpandable ? "" : isExpanded ? "expanded" : "collapsed"} $expandedHeight={cardsContainerHeight}>
        <CardsContainer ref={cardsContainerRef}>
          {cards.map((el) => {
            return <CardComponent card={el} key={el.name} />
          })}
        </CardsContainer>
        <PreviewOverlay onClick={toggleExpand} className={!isExpandable || isExpanded ? "hidden" : "visible"} />
      </ShowcaseContainer>
      {isExpandable && <>
        <ArrowButton onClick={toggleExpand}>
          {isExpanded ? <FaChevronUp/> : <FaChevronDown/>}
        </ArrowButton>
      </>}
      <Spacer/>
    </div>
  )
}

/**
 * NOTE: Many of the React components here are taken from the existing Cards UI
 */

const ShowcaseContainer = styled.div<{$expandedHeight: number}>`
  position: relative;
  overflow-y: hidden;

  &.collapsed {
    max-height: ${cardWidthHeight + expandPreviewHeight}px;
  }

  &.expanded {
    max-height: ${(props) => `${props.$expandedHeight}px`};
  }

  transition: max-height ${transitionDuration} ${transitionTimingFunction};
`

const ArrowButton = styled.div`
  text-align: center;
  font-size: 1.8rem;
  width: 100%;
  height: 1em;
  cursor: pointer;
`

const PreviewOverlay = styled.div`
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) -100%,
    rgba(255, 255, 255, 1) 100%);
  width: 100%;
  height: ${expandPreviewHeight}px;
  cursor: pointer;

  &.visible {
    opacity: 1;
  }

  &.hidden {
    opacity: 0;
  }

  transition: opacity ${transitionDuration} ${transitionTimingFunction};
`;

const CardsContainer = styled.div`
  /* background-color: #ffeab0; */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${cardWidthHeight}px, max-content));
  grid-gap: 1%;
  overflow: hidden;
  justify-content: center;
`;

const Spacer = styled.div`
  min-height: 25px;
`

export const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-width: ${cardWidthHeight}px;
  min-height: ${cardWidthHeight}px;
  max-width: ${cardWidthHeight}px;
  max-height: ${cardWidthHeight}px;
`

export const CardInner = styled.div`
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`;

export const CardTitle = styled.div<{$squashed: boolean}>`
  font-family: ${(props) => props.theme.generalFont};
  font-weight: 500;
  font-size: ${(props) => props.$squashed ? "21px" : "25px"};
  @media (max-width: 768px) {
    font-size: 22px;
  }
  position: absolute;
  border-radius: 3px;
  padding: 10px 20px 10px 10px;
  top: 15px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`;

export const CardImgWrapper = ({filename}) => {
  let src;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/${filename}`).default.src;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/empty.png`).default.src;
  }
  return <CardImg src={src} alt={""} />
}
