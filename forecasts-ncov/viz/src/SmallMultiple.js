import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';
import * as d3 from "d3";

/**
 * A lot of these functions can be broken out into custom hooks / separate files.
 * But for now, this is easier...
 */

const D3Container = styled.div`
  & > div { /* TOOLTIP */
    position: fixed;
    display: none;
    padding: 12px 6px;
    background: #fff;
    border: 1px solid #333;
    pointer-events: none;
  }
`;

const dateFormatter = (dStr) => {
  const date = d3.timeParse("%Y-%m-%d")(dStr);
  if (parseInt(d3.timeFormat("%d")(date), 10)===1) {
    return `${d3.timeFormat("%b")(date)}`;
  }
  return '';
}

const generalXAxis = (x, sizes, textFn) => {
  return (g) => g
    .attr("transform", `translate(0,${sizes.height - sizes.margin.bottom})`)
    .call(d3.axisBottom(x).tickSize(0))
    // .call(g => g.select(".domain").remove())
    .selectAll("text")
      .text(textFn)
      // .attr("y", 0)
      // .attr("x", (d) => x(d))
      .attr("dy", "0.6em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .style("fill", "#aaa");
}

const simpleYAxis = (y, sizes, textFun = (d) => d) => (g) => g
  .attr("transform", `translate(${sizes.margin.left},0)`)
  .call(d3.axisLeft(y).tickSize(0).tickPadding(4))
  // .call(g => g.select(".domain").remove())
  .selectAll("text")
    .text(textFun)
    .style("font-size", "12px")
    .style("fill", "#aaa");

const svgSetup = (dom, sizes) => {
  dom.selectAll("*").remove();

  return dom.append("svg")
    .attr("width", sizes.width)
    .attr("height", sizes.height)
    .attr("viewBox", `0 0 ${sizes.width} ${sizes.height}`);
}

const title = (svg, sizes, text) => {
  // top-left so we don't obscure any recent activity
  svg.append("text")
    .text(text)
    .attr("x", sizes.margin.left+5)
    .attr("y", sizes.margin.top) // todo!
    .style("text-anchor", "start")
    .style("dominant-baseline", "hanging")
    .style("font-size", "16px")
    .style("fill", "#444");
}

const frequencyPlot = (dom, sizes, location, modelData) => {
  const svg = svgSetup(dom, sizes);

  const x = d3.scalePoint()
    .domain(modelData.get('dates'))
    .range([sizes.margin.left, sizes.width-sizes.margin.right]);

  svg.append("g")
      .call(generalXAxis(x, sizes, dateFormatter));

  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([sizes.height-sizes.margin.bottom, sizes.margin.top]); // y=0 is @ top. Range is [bottom_y, top_y] which maps 0 to the bottom and 1 to the top (of the graph)

  svg.append("g")
    .call(simpleYAxis(y, sizes, d3.format(".0%")));

  // Add dots - one group per variant
  /* note map.forEach() returns a tuple of (value, key, map) -- perhaps not the order you expect! */
  modelData.get('points').get(location).forEach((variantPoint, variant) => {
    const temporalPoints = variantPoint.get('temporal')
      .filter((point) => !!point.get('date'));
    svg.append('g')
      .selectAll("dot")
      .data(temporalPoints)
      .enter()
      .append("circle")
        .attr("cx", (d) => x(d.get('date')))
        .attr("cy", (d) => y(d.get('freq')))
        .attr("r", 1.5)
        .style("fill", modelData.get('variantColors').get(variant) ||  modelData.get('variantColors').get('other'))
  });

  title(svg, sizes, location)
}


const rtPlot = (dom, sizes, location, modelData) => {
  // todo: y-axis domain depending on data
  // todo: CIs

  const svg = svgSetup(dom, sizes);

  const x = d3.scalePoint()
    .domain(modelData.get('dates'))
    .range([sizes.margin.left, sizes.width-sizes.margin.right]);

  svg.append("g")
      .call(generalXAxis(x, sizes, dateFormatter));

  const y = d3.scaleLinear()
    // .domain(modelData.get('domains').get('rt'))
    .domain([0, 3])
    .range([sizes.height-sizes.margin.bottom, sizes.margin.top]); // y=0 is @ top. Range is [bottom_y, top_y] which maps 0 to the bottom and 1 to the top (of the graph)

  svg.append("g")
    .call(simpleYAxis(y, sizes));

  /* coloured lines for each variant */
  // line path generator
  const line = d3.line()
    .defined(d => !isNaN(d.get('r_t')))
    .curve(d3.curveLinear)
    .x((d) => x(d.get('date')))
    .y((d) => y(d.get('r_t')))

  modelData.get('points').get(location).forEach((variantPoint, variant) => {
    const temporalPoints = variantPoint.get('temporal');
    const color = modelData.get('variantColors').get(variant) || modelData.get('variantColors').get('other');
    const g = svg.append('g');
    g.append('path')
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8)
      .attr("d", line(temporalPoints));
    const finalPt = finalValidPoint(temporalPoints, 'r_t');
    if (!finalPt) return;
    g.append("text")
      .text(`${parseFloat(finalPt.get('r_t')).toPrecision(2)}`)
      .attr("x", x(finalPt.get('date')))
      .attr("y", y(finalPt.get('r_t')))
      .style("text-anchor", "start")
      .style("alignment-baseline", "baseline")
      .style("font-size", "12px")
      .style("fill", color)
  });

  /* dashed horizontal line at r_t=1 */
  svg.append('path')
    .attr("fill", "none")
    .attr("stroke", "#444")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 1)
    .attr("d", `M ${sizes.margin.left} ${y(1.0)} L ${sizes.width-sizes.margin.right} ${y(1.0)}`)
    .style("stroke-dasharray", "4 2")

  title(svg, sizes, location)
}

const stackedIncidence = (dom, sizes, location, modelData) => {
  const svg = svgSetup(dom, sizes);

  const x = d3.scalePoint()
    .domain(modelData.get('dates'))
    .range([sizes.margin.left, sizes.width-sizes.margin.right]);

  svg.append("g")
      .call(generalXAxis(x, sizes, dateFormatter));

  /* maximum value by looking at final variant (i.e. on top of the stack) */
  const variants = modelData.get('variants');
  const dataPerVariant = modelData.get('points').get(location)
  const maxI = d3.max(
    dataPerVariant.get(variants[variants.length-1]).get('temporal')
      .map((point) => point.get('I_smooth_y1'))
  );

  const y = d3.scaleLinear()
    .domain([0, maxI])
    .range([sizes.height-sizes.margin.bottom, sizes.margin.top]); // y=0 is @ top. Range is [bottom_y, top_y] which maps 0 to the bottom and 1 to the top (of the graph)

  svg.append("g")
    .call(simpleYAxis(y, sizes, d3.format("~s")));

  svg.append('g')
    .selectAll("stackedLayer")
    .data(variants)
    .enter()
    .append("path")
      .style("fill", (variant) => modelData.get('variantColors').get(variant) || modelData.get('variantColors').get('other'))
      .style("fill-opacity", 0.5)
      .style("stroke", (variant) => modelData.get('variantColors').get(variant) || modelData.get('variantColors').get('other'))
      .style("stroke-width", 0.5)
      .attr("d", (variant) => (d3.area()
        .defined((point) => !!point.get('date'))
        .x((point) => x(point.get('date')))
        .y0((point) => y(point.get('I_smooth_y0')))
        .y1((point) => y(point.get('I_smooth_y1')))
      )(dataPerVariant.get(variant).get('temporal')))

  title(svg, sizes, location)
}



const categoryPointEstimate = (dom, sizes, location, modelData, dataKey) => {
  const svg = svgSetup(dom, sizes);

  // Removes the pivot category that does not need to be plotted.
  const x = d3.scalePoint()
    .domain(['', ...modelData.get('variants').filter(v => v !== modelData.get('pivot'))])
    .range([sizes.margin.left, sizes.width-sizes.margin.right]);

  svg.append("g")
    .call(generalXAxis(x, sizes, (variant) => modelData.get('variantDisplayNames').get(variant) || variant));

  const points = Array.from(
      modelData.get('points').get(location),
      ([variant, variantMap]) => variantMap
    )
    .filter((pt) => !isNaN(pt.get(dataKey)))

  const y = d3.scaleLinear()
    // .domain([
    //   d3.min(points.map((pt) => pt.get(dataKey))) * 0.9, // todo - should use CIs
    //   d3.max(points.map((pt) => pt.get(dataKey))) * 1.1 // todo - should use CIs
    // ])
    .domain(modelData.get('domains').get('ga'))
    .range([sizes.height-sizes.margin.bottom, sizes.margin.top]); // y=0 is @ top. Range is [bottom_y, top_y] which maps 0 to the bottom and 1 to the top (of the graph)

  svg.append("g")
    .call(simpleYAxis(y, sizes));

  svg.append('g')
    .selectAll("dot")
    .data(points)
    .enter()
    .append("circle")
      .attr("cx", (d) => x(d.get('variant')))
      .attr("cy", (d) => y(d.get(dataKey)))
      .attr("r", 4)
      .style("fill", (d) => modelData.get('variantColors').get(d.get('variant')) ||  modelData.get('variantColors').get('other'))

  svg.append('g')
    .selectAll("HDI")
    .data(points)
    .enter()
    .append('path')
      .attr("fill", "none")
      .attr("stroke", (d) => modelData.get('variantColors').get(d.get('variant')) ||  modelData.get('variantColors').get('other'))
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 1)
      .attr("d", (d) => `M ${x(d.get('variant'))} ${y(d.get(dataKey+"_HDI_95_lower"))} L ${x(d.get('variant'))} ${y(d.get(dataKey+"_HDI_95_upper"))}`)

  title(svg, sizes, location)
}

export const SmallMultiple = ({location, graph, sizes, modelData}) => {

  const d3Container = useRef(null);

  useEffect(
    () => {
      const dom = d3.select(d3Container.current);

      switch (graph) {
        case 'freq':
          frequencyPlot(dom, sizes, location, modelData);
          break;
        case 'r_t':
          rtPlot(dom, sizes, location, modelData);
          break;
        case 'stackedIncidence':
          stackedIncidence(dom, sizes, location, modelData);
          break;
        case 'ga':
          categoryPointEstimate(dom, sizes, location, modelData, 'ga');
          break;
        default:
          console.error(`Unknown graph type ${graph}`)
      }

    },
    [modelData, graph, sizes, location]
  );

  return (
    <D3Container ref={d3Container}/>
  )
}

function finalValidPoint(points, key) {
  for (let i=points.length-1; i>0; i--) {
    if (!isNaN(points[i].get(key))) return points[i];
  }
  return null;
}
