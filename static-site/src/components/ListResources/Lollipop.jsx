/* eslint-disable react/prop-types */
import React from 'react';
import styled from 'styled-components';
import * as d3 from "d3";
// import { RAINBOW20 } from "./ResourceModal.jsx";


const [height, width] = [15, 80]

const Container = styled.div`
  min-width: ${width}px;
`

export function Lollipop({x, date, dates}) {
  // const cx = x(new Date(date));
  // const color = RAINBOW20[Math.floor(cx/(width+1) * 20)]


  // const bins = d3.bin().value((v) => new Date(v)).thresholds(x._thresholds)(dates)
  // console.log("lollipop bins", bins)

  // thresholds are already set
  const thresholds = x._thresholds;
  const data = dates.map((d) => x._getX(new Date(d)));
  const bandwidth = 60;
  // console.log(thresholds, "data", data, bandwidth)
  const k = kde(epanechnikov(bandwidth), thresholds, data);

  const maxY = d3.max(k.map(el=>el[1]))
  if (!maxY) return (
    <Container/>
  )

  const y = d3.scaleLinear()
    .domain([0, maxY]) // this means comparisons across KDEs aren't really valid
    .range([height, 0]);

  const path = (d3.area()
    .x((el) => x(el[0]))
    .y0(y(0))
    .y1((el) => y(el[1]))
    .curve(d3.curveBasis))(k)


  return (
    <Container>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1="0" x2={width} y1={height} y2={height} stroke="#b2b2b2"/>
        <path d={path} fill={'rgb(108, 183, 221)'} opacity={1}/>
      </svg>
    </Container>
  )
}






export function lollipopScale(x1, x2) {

  const span = [new Date(x1), new Date(x2)]

  // const x = d3.scaleTime()
  //   .domain(span)
  //   .range([0, width])



  const duration = Math.round((span[1]-span[0])/(1000*60*60*24)); // In days. Doesn't account for time complexities. 
  const getX = (dateObj) => Math.round((dateObj-span[0])/(1000*60*60*24));

  const numThresholds = 40;
  const thresholdAmount = duration/(numThresholds-1);
  const thresholds = [0]
  while (thresholds.length<numThresholds) {
    thresholds.push(thresholds.at(-1)+thresholdAmount)
  }

  // console.log("span", span, duration, thresholds)


  const x = d3.scaleLinear()
    .domain([0, duration])
    .range([0, width])


  // const bins = d3.bin().thresholds(20)(span);
  // const thresholds = [bins[0].x0, ...bins.map((b) => b.x1)]



  // console.log("THRESHOLDS", thresholds)

  x._thresholds = thresholds;
  x._getX = getX;

  const domMax = 0.001;

  // const y = d3.scaleLinear()
  //   .domain([0, domMax])
  //   .range([height, 0]);

  // x._path = d3.area()
  //   .x((el) => x(el[0]))
  //   .y0(y(0))
  //   .y1((el) => y(el[1]))
  //   .curve(d3.curveBasis)


  return x;
}


// <https://observablehq.com/@d3/kernel-density-estimation@172>

// thresholds are like the breaks / ticks where we want to evaluate the data, i.e. n=20?
// data is an array of dates (probably date objects)
// 

// kde is an array of elements each:
//     [threshold value ,   mean of kernel-transformed distance of data points to this threshold value]
// kernel takes {distance/bandwidth} and returns 0 (if distance>bandwidth) or 0.75 * (1-distance^2)/bandwidth

function kde(kernel, thresholds, data) {
  return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
}
function epanechnikov(bandwidth) {
  return (x) => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
}