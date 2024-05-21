/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import styled from 'styled-components';
import {CardInner, CardImg, CardTitle} from "../Cards/styles";
import { theme } from "../../layouts/theme";
import { goToAnchor } from '../../../vendored/react-scrollable-anchor/index';
import { createFilterOption } from "./useFilterOptions";

const cardWidthHeight = 160; // pixels

export const Showcase = ({cards, setSelectedFilterOptions}) => {
  if (!cards.length) return null;

  // Generate options for carousel
  let responsiveOptions = {};

  for (let i = 0; i < cards.length; i++) {
    const breakpointMin = i * cardWidthHeight;
    let breakpointMax = (i + 1) * cardWidthHeight;

    // Don't limit max otherwise carousel won't render at all on larger screens
    if (i == cards.length - 1) {
      breakpointMax = 999999
    }

    responsiveOptions[i] = {
      breakpoint: { max: breakpointMax, min: breakpointMin },
      items: i
    };
  }

  return (
    <div>
      <Byline>
        Showcase resources: click to filter the resources to a pathogen
      </Byline>
      <Carousel responsive={responsiveOptions} renderButtonGroupOutside={true}>
        {cards.map((el) => (
          <ShowcaseTile data={el} key={el.name} setSelectedFilterOptions={setSelectedFilterOptions}/>
          ))}
      </Carousel>
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
          <CardTitle $squashed>
            {data.name}
          </CardTitle>
          <CardImgWrapper filename={data.img}/>
        </div>
      </CardInner>
    </CardOuter>
  )
}

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