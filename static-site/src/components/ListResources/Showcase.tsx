/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styled from 'styled-components';
import {CardInner, CardImg, CardTitle} from "../Cards/styles";
import { theme } from "../../layouts/theme";
import { goToAnchor } from '../../../vendored/react-scrollable-anchor/index';
import { createFilterOption } from "./useFilterOptions";
import { LIST_ANCHOR } from "./index";
import { Card, FilterOption, Group } from './types';

const cardWidthHeight = 160; // pixels
const expandPreviewHeight = 50 //pixels
const transitionDuration = "0.3s"
const transitionTimingFunction = "ease"

interface ShowcaseProps {
    cards: Card[]
    setSelectedFilterOptions: React.Dispatch<React.SetStateAction<readonly FilterOption[]>>
}

export const Showcase = ({cards, setSelectedFilterOptions}: ShowcaseProps) => {

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
      <Byline>
        Showcase resources: click to filter the resources to a pathogen
      </Byline>
      <ShowcaseContainer className={!isExpandable ? "" : isExpanded ? "expanded" : "collapsed"} $expandedHeight={cardsContainerHeight}>
        <CardsContainer ref={cardsContainerRef}>
          {cards.map((el) => (
            <ShowcaseTile card={el} key={el.name} setSelectedFilterOptions={setSelectedFilterOptions}/>
            ))}
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

interface ShowcaseTileProps {
    card: Card
    setSelectedFilterOptions: React.Dispatch<React.SetStateAction<readonly FilterOption[]>>
}

/**
 * NOTE: Many of the React components here are taken from the existing Cards UI
 */
const ShowcaseTile = ({card, setSelectedFilterOptions}: ShowcaseTileProps) => {
  const filter = useCallback(
    () => {
      setSelectedFilterOptions(card.filters.map(createFilterOption));
      goToAnchor(LIST_ANCHOR);
    },
    [setSelectedFilterOptions, card]
  )

  return (
    <CardOuter>
      <CardInner>
        <div onClick={filter}>
          <CardTitle $squashed>
            {card.name}
          </CardTitle>
          <CardImgWrapper filename={card.img}/>
        </div>
      </CardInner>
    </CardOuter>
  )
}


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

const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-width: ${cardWidthHeight}px;
  min-height: ${cardWidthHeight}px;
  max-width: ${cardWidthHeight}px;
  max-height: ${cardWidthHeight}px;
`

const themeColors = [...theme.titleColors];
const getColor = () => {
  // rotate colors by moving the first color (which is always defined) to the end
  themeColors.push(themeColors.shift()!);
  // return the last color
  return themeColors.at(-1);
}

const CardImgWrapper = ({filename}) => {
  let src;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/${filename}`).default.src;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    src = require(`../../../static/splash_images/empty.png`).default.src;
  }
  return <CardImg src={src} alt={""} color={getColor()}/>
}

const Byline = styled.div`
  font-size: 1.6rem;
  border-top: 1px rgb(230, 230, 230) solid;
`

/**
 * Given a set of user-defined cards, restrict them to the set of cards for
 * which the filters are valid given the resources known to the resource listing
 * UI
 */
export const useShowcaseCards = (cards?: Card[], groups?: Group[]) => {
  const [restrictedCards, setRestrictedCards] = useState<Card[]>([]);
  useEffect(() => {
    if (!cards || !groups) return;
    const words = groups.reduce((words, group) => {
      for (const resource of group.resources) {
        for (const word of resource.nameParts) {
          words.add(word);
        }
      }
      return words;
    }, new Set<string>());
    setRestrictedCards(cards.filter((card) => card.filters.every((word) => words.has(word))));
  }, [cards, groups]);
  return restrictedCards;
}