/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {CardInner, CardImg, CardTitle} from "../Cards/styles";
import { theme } from "../../layouts/theme";
import { goToAnchor } from '../../../vendored/react-scrollable-anchor/index';
import { createFilterOption } from "./useFilterOptions";
import { LIST_ANCHOR } from "./index";
import { Card, FilterOption, Group } from './types';

const cardWidthHeight = 160; // pixels

interface ShowcaseProps {
    cards: Card[]
    setSelectedFilterOptions: React.Dispatch<React.SetStateAction<readonly FilterOption[]>>
}

export const Showcase = ({cards, setSelectedFilterOptions}: ShowcaseProps) => {
  if (!cards.length) return null;
  return (
    <div>
      <Byline>
        Showcase resources: click to filter the resources to a pathogen
      </Byline>
      <SingleRow>
        <ShowcaseContainer>
          {cards.map((el) => (
            <ShowcaseTile card={el} key={el.name} setSelectedFilterOptions={setSelectedFilterOptions}/>
            ))}
        </ShowcaseContainer>
      </SingleRow>
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


/* SingleRow only shows a single row of tiles. By using this to wrap a flexbox
element we can leverage the intelligent wrapping of the flexbox to decide how
many tiles to show in a single row. The downside is that showcase tiles are
still in the DOM, and the images are still fetched etc */
const SingleRow = styled.div`
  max-height: ${cardWidthHeight}px;
  overflow-y: clip;
`

const ShowcaseContainer = styled.div`
  /* background-color: #ffeab0; */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow: hidden;
  overflow: hidden;
  justify-content: space-between;
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
    src = require(`../../../static/splash_images/${filename}`).default.src;
  } catch {
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