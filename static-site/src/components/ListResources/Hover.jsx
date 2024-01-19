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
  position: absolute;
  width: max-content;
  left: 30px;
  top: 25px;
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
export const Hover = ({dates}) => {
  console.log("<Hover>")
  return (
    <Container>

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
