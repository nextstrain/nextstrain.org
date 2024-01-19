/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';


const ShowcaseContainer = styled.div`
  background-color: #ffeab0;
  display: flex;
  flex-direction: row;
`;

const Tile = styled.div`
  min-width: 120px;
  max-width: 120px;
  min-height: 120px;
  max-height: 120px;
  color: white;
  font-weight: 700;
  border: 1px solid black;
  margin: 20px;
  background-color: #f5b607;
`

const ShowcaseTile = ({data}) => {
  return <Tile>
    {data.name}
  </Tile>
}


/**
 * <Tiles> contains the all the displayed resources.
 * The supplied resources have already been grouped and are an array of
 * data with each element rendered as a tile. Each element looks like
 * [ TileInfo, TileMember[]]
 * 
 * @param {Object} props
 * @param {Array} props.data
 * @returns {React.Component}
 */
export const Showcase = ({data}) => {

  return (
    <ShowcaseContainer>
      {data.map((el) => (
        <ShowcaseTile data={el} key={el.name} />
      ))}
    </ShowcaseContainer>
  )

}
