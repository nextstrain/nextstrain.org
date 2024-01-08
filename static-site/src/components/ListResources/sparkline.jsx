import * as d3 from "d3";
import React from 'react';

const x = d3.scaleLinear()
  .domain([0, 104]) // 2 x 52 weeks
  .range([0, 100]); // viewBox

/**
 * <SparkLine> renders a SVG path showing the frequency of resource updates over
 * the past 2 years using a simple convolution + curve smoothing.
 * The returned element has width 300px, height 30px
 */
export const SparkLine = ({versions, onClick}) => {
  if (!versions.length) return null;
  const v = versions.map((x) => x[0])  // array of YYYY-MM-DD strings
    .sort();                           // oldest version first
  const yVals = (new Array(104)).fill(0);
  let d = new Date()
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
  const y = d3.scaleLinear()
    .domain([0, d3.max([maxY, 2])])
    .range([9.5, 0.5]) // essentially the viewBox

  const line = (d3.line()
    .x((_value, idx) => x(idx))
    .y((value) => y(value))
    .curve(d3.curveBasis)
  )(yVals)
  
  return (
    <div
      data-tooltip-id="iconTooltip"
      data-tooltip-content="The frequency of updates over the past 2 years"
      data-tooltip-place="top"
      style={{ marginLeft: 'auto',  marginRight: '0' }}
      // onClick={onClick}
    >
      <svg width={300} height={30} viewBox="0 0 100 10">
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
        <path d={line||''} stroke={maxY===0? "#d0d1e6" : "url('#fadeGrad')"} strokeWidth={0.5} fill={'none'} opacity={0.6}/>
      </svg>
    </div>
  )
}
