/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import styled from 'styled-components';
import {CardInner, CardImg, CardTitle} from "../Cards/styles";
import { theme } from "../../layouts/theme";
import { goToAnchor } from 'react-scrollable-anchor';


/** showcaseData should come from the API query, which allows dynamic showcases,
 * e.g. for /groups you can get the groups you administer? Or maybe for
 * individual groups/community the configJson (on the S3 bucket, or git repo)
 * defines the showcase dataset queries? For staging and core I guess we
 * hardcode it somewhere in the repo... placing it here for now
 */
const showcaseData = [
  {name: "Seasonal Flu", img: "seasonalinfluenza.png", filters: ["flu", "seasonal"]},
  {name: "Avian Flu",    img: "avianinfluenza.png",    filters: ["flu", "avian"]},
  {name: "SARS-CoV-2",   img: "ncov_narrative.png",    filters: ["ncov"]},
  {name: "mpox",         img: "mpox.png",              filters: ["mpox"]},
  {name: "RSV",          img: "rsv1.png",              filters: ["rsv"]},
]

/**
 * Quicklinks are similar to showcase data & should also come from the API.
 * Hardcoding here for convenience. 
 */
export const quickLinkData = [
  {name: 'flu/seasonal/h3n2/ha/2y', display: 'h3n2/ha'},
  {name: 'flu/seasonal/h1n1pdm/ha/2y', display: 'h1n1pdm/ha'},
  {name: 'flu/seasonal/vic/ha/2y', display: 'vic/ha'},
  {name: 'rsv/a/genome', display: 'RSV/A'},
  {name: 'rsv/b/genome', display: 'RSV/B'},
  {name: 'flu/avian/h5nx/ha', display: 'h5nx/ha'},
]

export const Showcase = ({availableFilterOptions, setSelectedFilterOptions}) => {
  /* We should validate that the showcase data (however it arrives) exists in
  the resources */

  // TODO - what happens if we want to filter to something ("flu") but because
  // of an existing filter it's not in availableFilterOptions?

  return (
    <div>
      <Byline>
        Showcase datasets: click on any of these tiles to filter the available datasets
      </Byline>
      <ShowcaseContainer>
        {showcaseData.map((el) => (
          <ShowcaseTile data={el} key={el.name} availableFilterOptions={availableFilterOptions} setSelectedFilterOptions={setSelectedFilterOptions}/>
        ))}
      </ShowcaseContainer>
    </div>
  )

}

/**
 * Most components simply taken from the previous Cards interface and not
 * updated
 */
const ShowcaseTile = ({data, availableFilterOptions, setSelectedFilterOptions}) => {
  const filter = useCallback(
    () => {
      const opts = availableFilterOptions.filter((opt) => data.filters.includes(opt.value))
      if (!opts.length) {
        console.error("No possible filters to set. TODO.");
        // This happens because of either a misconfigured showcase (e.g. ["rsv"]
        // when no RSV datasets in the resource listing) or, more commonly,
        // because we have a non-RSV filter in place which means RSV isn't in
        // the available filter options.
        return
      }
      setSelectedFilterOptions(opts)
      // TODO -- we also want to scroll down to the start of the dataset listings

      goToAnchor("list");

    },
    [availableFilterOptions, setSelectedFilterOptions, data]
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


const ShowcaseContainer = styled.div`
  /* background-color: #ffeab0; */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 25px;
  overflow: hidden;
  justify-content: space-between;
`;

const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  padding: 15px 0px 15px 0px;
  width: 160px;
  height: 160px;
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
  font-size: 16px;
  border-top: 1px rgb(230, 230, 230) solid;

`