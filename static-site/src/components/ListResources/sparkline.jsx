import * as d3 from "d3";
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-left: auto;
  margin-right: 0;
  position: relative;
  svg {
    font-size: 4px; /* viewbox units, not screen pixels */
  }
`


/**
 * <SparkLine> renders a SVG path showing the frequency of resource updates.
 * 
 * Do we want this over a fixed period? E.g. the last two years? 
 * It may be nicer to show this going right back to the start, but then
 * it's harder to do a quick comparison when mousing over different datasets.
 * 
 * The returned element has width 300px, height 30px
 */
export const SparkLine = ({versions}) => {
  if (!versions.length) return null;
 
  const viewbox = [0, 0, 100, 20];
  const x = d3.scaleLinear().range([0, viewbox[2]]);
  const y = d3.scaleLinear().range([viewbox[3]-4, 0]);
  const line = _line(versions, x, y);
  
  return (
    <Container>
      <svg width={400} height={80} viewBox={viewbox.join(" ")} style={{backgroundColor: "#fff"}}>
        <defs>
          <linearGradient id='fadeGrad' x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#d0d1e6" />
            <stop offset="20%" stopColor="#a6bddb" />
            <stop offset="40%" stopColor="#74a9cf" />
            <stop offset="60%" stopColor="#3690c0" />
            <stop offset="80%" stopColor="#0570b0" />
            <stop offset="100%" stopColor="#045a8d" />
          </linearGradient>
        </defs>
        <path d={line.path||''} stroke={line.maxY===0? "#d0d1e6" : "url('#fadeGrad')"} strokeWidth={0.5} fill={'none'} opacity={1}/>
        <text x={line.axisDates[0][0]} y={y.range()[0]} textAnchor="start" dominantBaseline="hanging">{line.axisDates[0][1]}</text>
        <text x={line.axisDates[1][0]} y={y.range()[0]} textAnchor="end" dominantBaseline="hanging">{line.axisDates[1][1]}</text>
      </svg>
    </Container>
  )
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function _line(versions, x, y) {
  const v = [...versions].sort(); // we will mutate this array
  const yVals = (new Array(104)).fill(0); // 52 weeks * 2 = 2 years
  x.domain([0, yVals.length])

  let d = new Date()
  const axisDates = [
    [x(yVals.length), `${MONTHS[d.getMonth()]} ${d.getFullYear()}`]
  ]

  for (let i=103; i>=0; i--) {
    d.setDate(d.getDate()-7);
    const dIso = d.toISOString()
    // naive comparison of YYYY-MM-DD strings + ISO strings works as expected
    while(v[v.length-1] > dIso) {
      yVals[i]++
      v.pop();
    }
  }
  const maxY = d3.max(yVals);
  axisDates.unshift([x(0), `${MONTHS[d.getMonth()]} ${d.getFullYear()}`])
  y.domain([0, d3.max([maxY, 2])])

  const path = (d3.line()
    .x((_, idx) => x(idx))
    .y((value) => y(value))
    .curve(d3.curveBasis)
  )(yVals)

  return {
    path,   // svg path
    maxY,   // maximum observed y value (not the domain limit)
    axisDates,
  }

}