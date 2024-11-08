/* eslint-disable react/prop-types */
import React, {useEffect, useState, useCallback, createContext} from 'react';
import styled from 'styled-components';
import * as d3 from "d3";
import { MdClose } from "react-icons/md";
import { dodge } from "./dodge";
import { Resource } from './types';

export const SetModalResourceContext = createContext<React.Dispatch<React.SetStateAction<Resource | undefined>> | null>(null);

export const RAINBOW20 =   ["#511EA8", "#4432BD", "#3F4BCA", "#4065CF", "#447ECC", "#4C91BF", "#56A0AE", "#63AC9A", "#71B486", "#81BA72", "#94BD62", "#A7BE54", "#BABC4A", "#CBB742", "#D9AE3E", "#E29E39", "#E68935", "#E56E30", "#E14F2A", "#DC2F24"];
const lightGrey = 'rgba(0,0,0,0.1)';


export const ResourceModal = ({
  resource,
  dismissModal,
}: {
  resource?: Resource
  dismissModal: () => void
}) => {  
  const [ref, setRef] = useState(null); 
  const handleRef = useCallback((node) => {setRef(node)}, [])

  useEffect(() => {
    const handleEsc = (event) => {
       if (event.key === 'Escape') {dismissModal()}
    };
    window.addEventListener('keydown', handleEsc);
    return () => {window.removeEventListener('keydown', handleEsc);};
  }, [dismissModal]);

  const scrollRef = useCallback((node) => {
    /* A CSS-only solution would be to set 'overflow: hidden' on <body>. This
    solution works well, but there are still ways to scroll (e.g. via down/up
    arrows) */
    node?.addEventListener('wheel', (event) => {event.preventDefault();}, false);
  }, []);

  useEffect(() => {
    if (!ref || !resource) return;
    _draw(ref, resource)
  }, [ref, resource])

  // modal is only applicable for versioned resources
  if (!resource || !resource.dates || !resource.updateCadence) return null;

  const summary = _snapshotSummary(resource.dates);
  return (
    <div ref={scrollRef}>
    
      <Background onClick={dismissModal}/>
      <ModalContainer onClick={(e) => {e.stopPropagation()}}>
        <CloseIcon onClick={dismissModal}/>
        <Title>{resource.name.replace(/\//g, "│")}</Title>

        <div style={{paddingBottom: '5px'}}>
          <Bold>
            {`${resource.dates.length} snapshots spanning ${summary.duration}: ${summary.first} - ${summary.last}`}
          </Bold>
          <a style={{fontSize: '1.8rem', paddingLeft: '10px'}}
            href={`/${resource.name}`}  target="_blank" rel="noreferrer noopener">
            (click to view the latest available snapshot)
          </a>
        </div>
        <div>
          {resource.updateCadence.description}
        </div>

        <div ref={handleRef} /> {/* d3 controlled div */}

        <div style={{fontStyle: 'italic'}}>
          Each circle represents a previous snapshot of the dataset.
          <Bold> Mouse-over the light-grey axis box</Bold> to identify the latest available snapshot for any given date, and click to load the snapshot.
          <br/>
          Alternatively, <Bold>hover over dots</Bold> to show the date the analysis was shared and <Bold>click on a dot</Bold> to load that particular snapshot.
          <p/>
          Note: circles represent update date which may differ from when the analysis was run.
          {` An updated dataset doesn't necessarily mean there was new data.`}
          {` Finally, there may be a very recent upload which is newer than ${summary.last} which is not shown on this page (loading the "latest available snapshot" will always fetch the latest version).`}

        </div>
      </ModalContainer>

    </div>
  )
}

const Bold = styled.span`
  font-weight: 500;
`

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
  z-index: 100;
`;

const Background = styled.div`
  position: fixed;
  min-width: 100%;
  min-height: 100%;
  overflow: hidden;
  left: 0;
  top: 0;
  background-color: ${lightGrey};
`

const CloseIcon = ({onClick}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{position: 'absolute', top: '15px', right: '15px', cursor: 'pointer' }}
      onClick={onClick} onMouseOver={() => {setHovered(true)}} onMouseOut={() => setHovered(false)}
    >
      <MdClose size='1.5em' color={hovered ? '#333' : '#999'}/>
    </div>
  )
}

const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
  padding-bottom: 15px;
`

function _snapshotSummary(dates: string[]) {
  const d = [...dates].sort()
  if (d.length < 1) throw new Error("Missing dates.")

  const d1 = new Date(d.at( 0)!).getTime();
  const d2 = new Date(d.at(-1)!).getTime();
  const days = (d2 - d1)/1000/60/60/24;
  let duration = '';
  if (days < 100) duration=`${days} days`;
  else if (days < 365*2) duration=`${Math.round(days/(365/12))} months`;
  else duration=`${Math.round(days/365)} years`;
  return {duration, first: d[0], last:d.at(-1)};
}

function _draw(ref, resource: Resource) {
  // do nothing if resource has no dates
  if (!resource.dates) return

  /* Note that _page_ resizes by themselves will not result in this function
  rerunning, which isn't great, but for a modal I think it's perfectly
  acceptable */  
  const sortedDateStrings = [...resource.dates].sort();
  const flatData = sortedDateStrings.map((version) => ({version, 'date': new Date(version)}));

  const width = ref.clientWidth;
  const graphIndent = 20;
  const heights = {
    height: window.innerHeight > 900 ? 450 : window.innerHeight > 600 ? 250 : 200,
    marginTop: 20,
    marginAboveAxis: 30,
    marginBelowAxis: 50,
    hoverAreaAboveAxis: 25,
    marginBelowHoverBox: 10,
  }
  const unselectedOpacity = 0.3;


  const selection = d3.select(ref);
  selection.selectAll('*').remove()
  const svg = selection
    .append('svg')
    .attr('width', width)
    .attr('height', heights.height)
  

  /* Create the x-scale and draw the x-axis */
  const x = d3.scaleTime()
    // presence of dates on resource has already been checked so this assertion is safe
    .domain([flatData[0]!.date, new Date()]) // the domain extends to the present day
    .range([graphIndent, width-graphIndent])
  svg.append('g')
    .attr("transform", `translate(0, ${heights.height - heights.marginBelowAxis})`)
    .call(d3.axisBottom(x).tickSize(15))
    .call((g) => {g.select(".domain").remove()})
    // .call((g) => {g.select(".domain").clone().attr("transform", `translate(0, -${heights.hoverAreaAboveAxis})`)})


  /** Elements which will be made visible on mouse-over interactions */
  const selectedVersionGroup = svg.append('g')
  selectedVersionGroup.append("line")
    .attr("class", "line")
    .attr("x1", 0).attr("x2", 0)
    .attr("y1", 100).attr("y2", heights.height - heights.marginBelowAxis)
    .style("stroke", "black").style("stroke-width", "2")
    .style("opacity", 0)
  selectedVersionGroup.append("text")
    .attr("class", "message")
    .attr("x", 0)
    .attr("y", heights.height - heights.marginBelowAxis - 6) // offset to bump text up
    .style("font-size", "1.8rem")
    .style("opacity", 0)


  /**
   * We use Observable Plot's `dodge` function to apply vertical jitter to the
   * snapshot circles. To calculate the most appropriate radius we use a simple
   * iterative approach. The current parameters mean the resulting radius will
   * be bounded between 4px & 20px
   */
  const availBeeswarmHeight = heights.height - heights.marginTop - heights.marginAboveAxis - heights.marginBelowAxis;
  let radius = 12;
  const padding = 1;
  let nextRadius = radius;
  let iterCount = 0;
  let beeswarmData;
  let beeswarmHeight = 0;
  let spareHeight = availBeeswarmHeight-beeswarmHeight-radius;
  const maxIter = 5;
  const radiusJump = 2;
  while (iterCount++<maxIter && spareHeight > 50) {
    const nextBeeswarmData = dodge(flatData, {
      radius: nextRadius * 2 + padding, 
      x: (d) => x(d['date'])
    });
    const nextBeeswarmHeight = d3.max(nextBeeswarmData.map((d) => d.y));
    const nextSpareHeight = availBeeswarmHeight-nextBeeswarmHeight-nextRadius;
    if (nextSpareHeight <= spareHeight && nextSpareHeight > 0) {
      beeswarmData = nextBeeswarmData;
      beeswarmHeight = nextBeeswarmHeight;
      spareHeight = nextSpareHeight;
      radius = nextRadius;
      nextRadius += radiusJump;
    } else {
      nextRadius -= radiusJump;
    }
  }

  /** draw the beeswarm plot */
  const beeswarm = svg.append("g")
    .selectAll("circle")
    .data(beeswarmData)
    .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", (d) => heights.height - heights.marginBelowAxis - heights.marginAboveAxis - radius - padding - d.y)
      .attr("r", radius)
      .attr('fill', color)
      // @ts-expect-error no-unused-vars
      .on("mouseover", function(e, d) {
        /* lower opacity of non-hovered, increase radius of hovered circle */
        beeswarm.join(
          // @ts-expect-error no-unused-vars
          (enter) => {}, /* eslint-disable-line */
          (update) => selectSnapshot(update, d)
        )
        /* update the vertical line + text which appears on hover */
        const selectedCircleX = d.x;
        const textR = selectedCircleX*2 < width;
        selectedVersionGroup.select(".line")
          .attr("x1", selectedCircleX)
          .attr("x2", selectedCircleX)
          .attr("y1", heights.height - heights.marginBelowAxis - heights.marginAboveAxis - radius - padding - d.y)
          .style("opacity", 1)
        selectedVersionGroup.select(".message")
          .attr("x", selectedCircleX + (textR ? 5 : -5))
          .style("opacity", 1)
          .style("text-anchor", textR ? "start" : "end")
          .text(`Snapshot from ${prettyDate(d.data.version)} (click to load)`)        
      })
      .on("mouseleave", function() {
        beeswarm.join(
          // @ts-expect-error no-unused-vars
          (enter) => {}, /* eslint-disable-line */
          (update) => resetBeeswarm(update)
        )
        /* hide the vertical line + text which appeared on mouseover */
        selectedVersionGroup.selectAll("*")
          .style("opacity", 0)
      })
      // @ts-expect-error no-unused-vars
      .on("click", function(e, d) {
        window.open(`/${resource.name}@${d.data.version}`,'_blank'); // TEST!
      })

  /**
   * Draw the light-grey bar which doubles as the axis. The mouseover behaviour
   * here is to select & show the appropriate snapshot relative to the mouse
   * position
   */
  svg.append("g")
    .append("rect")
      .attr('x', x.range()[0])
      .attr('y', heights.height - heights.marginBelowAxis - heights.hoverAreaAboveAxis)
      .attr('width', x.range()[1] - x.range()[0])
      .attr('height', heights.hoverAreaAboveAxis)
      .attr('stroke', 'black')
      .attr('fill', lightGrey)
      .on("mousemove", function(e) {
        const { datum, hoveredDateStr } = getVersion(e);
        beeswarm.join(
            // @ts-expect-error no-unused-vars
            (enter) => {}, /* eslint-disable-line */
            (update) => selectSnapshot(update, datum)
        )
        /* update the vertical line + text which appears on hover */
        const selectedCircleX = datum.x;
        const textR = selectedCircleX*2 < width;
        const prettyDates = prettyDate(hoveredDateStr, datum.data.version);
        selectedVersionGroup.select(".line")
          .attr("x1", selectedCircleX)
          .attr("x2", selectedCircleX)
          .attr("y1", heights.height - heights.marginBelowAxis - heights.marginAboveAxis - radius - padding - datum.y)
          .style("opacity", 1)
        selectedVersionGroup.select(".message")
          .attr("x", selectedCircleX + (textR ? 5 : -5))
          .style("opacity", 1)
          .style("text-anchor", textR ? "start" : "end")
          .text(`On ${prettyDates[0]} the latest snapshot was from ${prettyDates[1]} (click to load)`)
      })
      .on("mouseleave", function() {
        beeswarm.join(
          // @ts-expect-error no-unused-vars
          (enter) => {}, /* eslint-disable-line */
          (update) => resetBeeswarm(update)
        )
        selectedVersionGroup.selectAll("*")
          .style("opacity", 0)
      })
      .on("click", function(e) {
        const { datum } = getVersion(e);
        window.open(`/${resource.name}@${datum.data.version}`,'_blank');
      })

  function selectSnapshot(selection, selectedDatum) {
    selection // fn is almost identical to beeswarm mouseover
      .attr("opacity", (d) => d===selectedDatum ? 1 : unselectedOpacity)
      .call((selection) => selection.transition()
        .delay(0).duration(150)
        .attr("r", (d) => d===selectedDatum ? radius*2 : radius)
      )
  }
  
  function resetBeeswarm(selection) {
    selection
      .attr("opacity", 1)
      .call((update) => update.transition()
        .delay(0).duration(150)
        .attr("r", radius)
      )
  }

  /**
   * Given a mouse event in the x-axis' range, find the snapshot which would
   * have been the latest at that point in time
   */
  function getVersion(mouseEvent) {
    const hoveredDate = x.invert(d3.pointer(mouseEvent)[0]);
    const hoveredDateStr = _toDateString(hoveredDate);
    const versionIdx = d3.bisect(sortedDateStrings, hoveredDateStr)-1;
    const datum = beeswarmData[versionIdx];
    return {datum, hoveredDateStr}
  }


  const dateWithYear = d3.utcFormat("%B %d, %Y");
  const dateSameYear = d3.utcFormat("%B %d");
  function prettyDate(mainDate: string, secondDate?: string) {
    const d1 = dateWithYear(new Date(mainDate));
    if (!secondDate) return d1;
    const d2 = (mainDate.slice(0,4)===secondDate.slice(0,4) ? dateSameYear : dateWithYear)(new Date(secondDate));
    return [d1, d2];
  } 


  /* Return the appropriate nextstrain rainbow colour of a circle via it's d.x
  position relative to the x-axis' range */
  function color(d) {
    const _xrange = x.range()
    let idx = Math.floor((d.x - _xrange[0]) / (_xrange[1] - _xrange[0]) * RAINBOW20.length)
    if (idx===RAINBOW20.length) idx--;
    return RAINBOW20[idx];
  }

  function _toDateString(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  
}