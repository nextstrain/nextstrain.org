/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import { ResourceGroup } from './ResourceGroup';

/**
 * TODO - flexbox or grid? Probably want grid-like aesthetics.
 */
// const ResourceTilesContainer = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   justify-content: space-between;
//   column-gap: 5px;
//   row-gap: 5px;
//   width: 100%;
// `

const ResourceListingContainer = styled.div`
  padding-top: 50px;
`;


/**
 * <Tiles> contains the all the displayed resources.
 * The supplied resources have already been grouped and are an array of
 * data with each element rendered as a tile. Each element looks like
 * [ TileInfo, TileMember[]]
 * 
 * @param {Object} props
 * @param {Array} props.data
 * @param {function} props.setModal
 * @returns {React.Component}
 */
export const ResourceListing = ({data, setModal}) => {
  return (
    <ResourceListingContainer>
      {data.map((tileData) => (
        <ResourceGroup data={tileData} setModal={setModal} key={tileData[0].groupName+tileData[0].lastUpdated} />
      ))}
    </ResourceListingContainer>
  )

}
