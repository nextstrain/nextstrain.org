/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import * as d3 from "d3";
import { RAINBOW20 } from "./ResourceModal.jsx";


const [height, width] = [15, 80]

const Container = styled.div`
`

export function Lollipop({x, date}) {
  const cx = x(new Date(date));
  console.log(cx, width)
  const color = RAINBOW20[Math.floor(cx/(width+1) * 20)]

  return (
    <Container>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{backgroundColor: "#f2f2f2"}}>
        <line x1="0" x2={width} y1={height/2} y2={height/2} stroke="#b2b2b2"/>
        <circle cx={cx} cy={height/2} r={height/2-1} fill={color} />
      </svg>
    </Container>
  )
}



export function lollipopScale(x1, x2) {
  const x = d3.scaleTime()
    .domain([new Date(x1), new Date(x2)])
    .range([0, width])
  return x;
}