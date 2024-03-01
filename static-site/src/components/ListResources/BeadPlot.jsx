/* eslint-disable */ 
import React, {memo, useRef, useState, useEffect} from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-width: 80%;
  background-color: #c2c21e;
`;


const BeadPlotRaw = ({versions, onClick, xPx}) => {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  console.log("ref.current", ref?.current)
  // useEffect(() => ref.current ? setWidth(ref.current.getBoundingClientRect().width) : {}, []);
  useEffect(() => {}, [])
  if (!versions.length) return null;
  
  console.log(width)
  return (
    <Container ref={ref}>
      Bead Plot
    </Container>
  )

  const viewBox = [0,0,100,10]; // This sets the aspect ratio, right? Probably want to change this?
  const yPx = xPx * viewBox[3]/viewBox[2];
  const yVals = calcXY(versions, 365, 12);

  const nY = yVals.length;
  const yMax = Math.max(...yVals)

  const horPad = 10;
  const radius = (y) => {
    const radiusMax = 4; // TKTK
    return Math.sqrt(y/yMax)*radiusMax;
  }
  const cx = (yIdx) => {
    return horPad + yIdx/nY*(viewBox[2]-2*horPad);
  }


  const AxisLabel = styled.div`
    position: absolute;
    font-size: 12px;
  `;


  return (
    <div
      data-tooltip-id="iconTooltip"
      data-tooltip-content="The frequency of updates over the past year"
      data-tooltip-place="top"
      style={{ backgroundColor: "white", position: 'relative' }}
      // onClick={onClick}
    >

      <svg width={xPx} height={yPx} viewBox={viewBox.join(" ")}>
        <line x1={horPad} y1="6" x2={viewBox[2]-horPad} y2="6" stroke="black"/>
        {yVals.map((y, idx) => {
          if (y===0) return null;
          return (
            <circle cx={cx(idx)} cy="6" r={radius(y)} fill={color(idx,nY)} fillOpacity="50%" key={cx(idx)}/>
          )
        })}
      </svg>

      <AxisLabel style={{left: 10, top: 15}}>2023</AxisLabel>
      <AxisLabel style={{right: 10, top: 15}}>2024</AxisLabel>
    </div>
  )
}

/**
 * I don't quite understand why I need to memoise this, but without it (and it
 * needs to be fixed) we get into an infinite loop, including
 * useSortAndFilterData re-running each time
 * 
 * Maybe because of the typo where AxisLabel is defined inside BeadPlotRaw?
 *
 */
export const BeadPlot = memo(
  BeadPlotRaw,
  (prevProps, currentProps) => prevProps.versions.length === currentProps.versions.length
)

/**
 * TODO -- this is expensive. Breaks should be cached.
 * 
 * TODO - debug - i'm sure there are bugs!
 * 
 * @param {*} versions - list of YYYY-DD-MM strings
 * @param {*} nDays    - number of days to look back
 * @param {*} nPoints  - number of x-axis divisions, i.e. max number of beads
 */
function calcXY(versions, nDays=365, nPoints=20){

  const _dateAgo = (n) => {
    const d = new Date()
    d.setDate(d.getDate() - n); // combine with above?
    return d.toISOString()
  }

  const yVals = (new Array(nPoints+1)).fill(0);


  const breaks = [_dateAgo(nDays)]
  for (let i=1; i<=nPoints; i++) {
    breaks.push(_dateAgo(nDays - nDays/nPoints*i))
  }
  let breakIdx = 0;
  versions.slice().sort().forEach((dateStr, idx) => {
    if (dateStr >= breaks[breakIdx]) {
      breakIdx++
    }
    yVals[breakIdx]++
  });

  return yVals.slice(1); // remove the first element which is prior to nDays
}


// const RAINBOW =   ["#511EA8", "#4928B4", "#4334BF", "#4041C7", "#3F50CC", "#3F5ED0", "#416CCE", "#4379CD", "#4784C7", "#4B8FC1", "#5098B9", "#56A0AF", "#5CA7A4", "#63AC99", "#6BB18E", "#73B583", "#7CB878", "#86BB6E", "#90BC65", "#9ABD5C", "#A4BE56", "#AFBD4F", "#B9BC4A", "#C2BA46", "#CCB742", "#D3B240", "#DAAC3D", "#DFA43B", "#E39B39", "#E68F36", "#E68234", "#E67431", "#E4632E", "#E1512A", "#DF4027", "#DC2F24"];
// 36
function color(idx, n) {
  return '#ffffff';
  // const startClamp = 15;
  // const endClamp = 35; // rainbow is len 36
  // let i = startClamp + Math.round((endClamp-startClamp)*idx/n);
  // if (i<startClamp) i=startClamp;
  // if (i>endClamp) i=endClamp;
  // return RAINBOW[i];
}