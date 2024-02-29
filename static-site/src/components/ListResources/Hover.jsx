/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import { SparkLine } from "./sparkline";


const nextstrainSidebarBorderColor = `rgb(204, 204, 204)`;

const Container = styled.div`
  font-size: 16px;
  background-color: #fff;
  border: 2px solid ${nextstrainSidebarBorderColor};
  margin-bottom: 10px;
  border-radius: 5px;
  padding: 10px;
  position: fixed;
  width: max-content;
  left: ${(props) => props.x-100}px;
  top: ${(props) => props.y+15}px;
  z-index: 999;
`;


const HelpText = styled.div`
  font-weight: 300;
  font-style: italic;
  font-size: 16px;
`


/**
 *
 */
export const Hover = ({dates, x, y}) => {
  // console.log("<Hover>", x, y)
  return (
    <Container x={x} y={y}>

      {dates.length} total snapshots, YY updates over the past two years:
      <SparkLine versions={dates}/>

      <HelpText>
        Click to load latest dataset (in a new tab)
      </HelpText>
      <HelpText>
        Shift-click to view all past snapshots
      </HelpText>
    </Container>
  )
}
