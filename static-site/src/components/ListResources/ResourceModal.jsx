/* eslint-disable react/prop-types */
import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import * as d3 from "d3";

const ModalContainer = styled.div`
  position: fixed;
  min-width: 80%;
  max-width: 80%;
  min-height: 80%;
  left: 10%;
  top: 10%;
  background-color: #fff;
  border: 2px solid black;
  font-size: 18px;
  padding: 20px;
`;

const Background = styled.div`
  position: fixed;
  min-width: 100%;
  min-height: 100%;
  left: 0;
  top: 0;
  background-color: rgba(0,0,0,0.1);
  /* TODO XXX - disable mouse scroll when modal open */
`

const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
  padding-bottom: 15px;
`

const RAINBOW20 =   ["#511EA8", "#4432BD", "#3F4BCA", "#4065CF", "#447ECC", "#4C91BF", "#56A0AE", "#63AC9A", "#71B486", "#81BA72", "#94BD62", "#A7BE54", "#BABC4A", "#CBB742", "#D9AE3E", "#E29E39", "#E68935", "#E56E30", "#E14F2A", "#DC2F24"];

/**
 * TKTK
 * @param {function} props.dismissModal
 */
export const ResourceModal = ({data, dismissModal}) => {

  const [ref, setRef] = useState(null);

  /**
   * I've previously not been able to use d3 to manipulate the DOM within Gatsby, but
   * the following seems to be working? It's a little bit buggy but that can be fixed
   */
  const handleRef = useCallback((node) => {setRef(node)})
  useEffect(() => {
    const handleEsc = (event) => {
       if (event.key === 'Escape') {dismissModal()}
    };
    window.addEventListener('keydown', handleEsc);
    return () => {window.removeEventListener('keydown', handleEsc);};
  }, [dismissModal]);

  useEffect(() => {
    if (!ref || !data) return;
    console.log("Model::useEffect")
    
    const selection = d3.select(ref);

    selection.selectAll('*').remove()

    const svg = selection
      .append('svg')
      .attr('width', 1000)
      .attr('height', 300)
      .style("background", "white");

    const tooltip = selection.append('div')
      .style("background-color", "#ddd")
      .style("border", "2px solid black")
      // .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "fixed")
      .style("opacity", 0) // starts hidden
      .style("pointer-events", "none")
    
    const versions = [...data.dates].sort().map((version) => ({version, 'date': new Date(version)}))

    const x = d3.scaleTime()
      .domain([versions[0].date, versions.at(-1).date])
      .range([50, 950])

    svg.append('g')
      .attr("transform", "translate(0, 250)")
      .call(d3.axisBottom(x).tickSize(10))

    const buckets = d3.bin()
      .value((d) => d.date.getTime())
      .thresholds(20)(versions);

    console.log("buckets", buckets)

    const maxInBin = d3.max(buckets, (d) => d.length)
    const y = d3
      .scaleLinear()
      .domain([0, maxInBin])
      .nice()
      .range([250, 10])

    // svg.append('g')
    //   .selectAll("rect")
    //   .data(buckets)
    //   .join("rect")
    //   .attr("fill", (d, i) => RAINBOW20[i])
    //   .attr("x", d => x(d.x0))
    //   .attr("width", d => Math.max(0, x(d.x1) - x(d.x0)))
    //   .attr("y", d => y(d.length))
    //   .attr("height", d => y(0) - y(d.length))
    //   .attr("fill-opacity", 0.2)


    const centers = buckets.map((b) => Math.max(0, x(b.x0) + (x(b.x1) - x(b.x0))/2) )


    const r = Math.min(
      ( y.range()[0] - y.range()[1] ) / maxInBin / 2,
      ( centers[1] - centers[0] ) / 2
    )

    svg.append('g')
      .selectAll("rect")
      .data(buckets)
      .enter().append("g")
      .each(function(binData, binIndex) {
        d3.select(this).selectAll('circle')
          .data(binData)
          .join("circle")
          .attr('cx', centers[binIndex])
          .attr('cy', (d, j) => y(j)-r)
          .attr('r', r-0.05)
          .attr('stroke', 'white')
          .attr('fill', RAINBOW20[binIndex])
          .on("mouseover", function(d) {
            tooltip.style('opacity', 1)
              .html(this.__data__.version)
              .style("left", d.clientX+10+"px") // TODO - switch to "right" when over half way?
              .style("top", d.clientY-20+"px");
            d3.select(this).attr('r', r*2);
          })
          .on("mouseleave", function() {
            tooltip.style('opacity', 0)
            d3.select(this).attr('r', r);
          })
          .on("click", function() {
            window.open(`/${data.name}@${this.__data__.version}`,'_blank');
          })
      })

  }, [ref, data])

  if (!data) return null;
  const summary = _snapshotSummary(data.dates);
  return (
    <Background onClick={dismissModal}>
      <ModalContainer onClick={(e) => {e.stopPropagation()}}>
        <Title>{data.name.replace(/\//g, "│")}</Title>

        {`${data.dates.length} snapshots spanning ${summary.duration}: ${summary.first} - ${summary.last}`}
        <p/>

        Each circle represents a previous snapshot of the dataset.{' '}
        <strong>Hover</strong> over dots to show the date the analysis was shared and <strong>click</strong> on any dot to load that particular snapshot.
        <div ref={handleRef} />
        {`Fine print: circles represent update date, not necessarily when the analysis was run and each dot doesn't imply new data was present`}
        <p/>
        {`Click outside this modal to remove it, or press Escape.`}
      </ModalContainer>
    </Background>
  )
}



function _snapshotSummary(dates) {
  const d = [...dates].sort()
  const [d1, d2] = [d[0], d.at(-1)].map((di) => new Date(di));

  /* convert duration into sensible english; should just use a date library instead */
  const days = (d2-d1)/1000/60/60/24;
  let duration = '';
  if (days < 100) duration=`${days} days`;
  else if (days < 365*2) duration=`${Math.round(days/(365/12))} months`;
  else duration=`${Math.round(days/365)} years`;

  return {duration, first: d[0], last:d.at(-1)};
}
