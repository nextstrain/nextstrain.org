/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {CardInner, CardImg, CardTitle} from "../Cards/styles";
import { theme } from "../../layouts/theme";
import { goToAnchor } from 'react-scrollable-anchor';
import { createFilterOption } from "./useFilterOptions";

const cardWidthHeight = 160; // pixels

export const Showcase = ({cards, setSelectedFilterOptions}) => {
  if (!cards.length) return null;
  return (
    <div>
      <Byline>
        Showcase resources: click to filter the resources to a pathogen
      </Byline>
      <SingleRow>
        <ShowcaseContainer>
          {cards.map((el) => (
            <ShowcaseTile data={el} key={el.name} setSelectedFilterOptions={setSelectedFilterOptions}/>
            ))}
        </ShowcaseContainer>
      </SingleRow>
      <Spacer/>
    </div>
  )
}

/**
 * NOTE: Many of the React components here are taken from the existing Cards UI
 */
const ShowcaseTile = ({data, setSelectedFilterOptions}) => {
  const filter = useCallback(
    () => {
      setSelectedFilterOptions(data.filters.map(createFilterOption));
      goToAnchor("list");
    },
    [setSelectedFilterOptions, data]
  )

  return (
    <CardOuter>
      <CardInner>
        <div onClick={filter}>
          <CardTitle squashed>
            {data.name}
          </CardTitle>
          <CardImgWrapper filename={data.img}/>
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
  themeColors.push(themeColors.shift());
  return themeColors.at(-1);
}

const CardImgWrapper = ({filename}) => {
  let src;
  try {
    src = require(`../../../static/splash_images/${filename}`);
  } catch {
    src = require(`../../../static/splash_images/empty.png`);
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
export const useShowcaseCards = (cards, resources) => {
  const [restrictedCards, setRestrictedCards] = useState([]);
  useEffect(() => {
    if (!cards || !resources) return;
    const words = resources.reduce((words, group) => {
      for (const resource of group.resources) {
        for (const word of resource.nameParts) {
          words.add(word);
        }
      }
      return words;
    }, new Set());
    setRestrictedCards(cards.filter((card) => card.filters.every((word) => words.has(word))));
  }, [cards, resources]);
  return restrictedCards;
}