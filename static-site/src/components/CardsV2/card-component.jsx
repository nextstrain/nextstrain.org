import React, { useState, useRef, useMemo } from 'react';
import { MdCached, MdOutlineShare, MdCoronavirus } from "react-icons/md";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import { SparkLine } from "./sparkLine.jsx";
// import { useGraph } from "../graph.ts";

/**
 * <Card> represents the UI for single resource collection. It is often called in a recursive
 * fashion to represent the hierarchy of collections.
 */
export const Card = ({data, outer=false}) => {
  const [details, setDetails] = useState('')
  return (
    <div style={{
      border: outer ? "2px solid #ece2f0" : '',
      borderTop: outer ? "2px solid #ece2f0" : "1px solid #ece2f0",
      marginLeft: outer ? '' : "20px",
      // minWidth: '100%',
      // maxWidth: '100%',
      minHeight: '50px',
      padding: '5px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: '0px',
      color: '#4F4B50',
      transition: 'all 0.5s ease-in-out', // TODO -- doesn't work. Height is dynamic.
    }}>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: '10px',
        alignItems: 'center',
        color: '#4F4B50',
      }}>
        {outer && Logo(data.name)}
        <Name name={data.name} url={data.url}/>
        <SparkLine versions={data.versions || []} onClick={()=>{setDetails(details==='versions'?'':'versions')}}/>
      </div>

      <IconRow data={data} details={details} setDetails={setDetails}/>

      <Details data={data} view={details}/>

      {(data.children) && (data.children.length!==0) && /* !data.collapsed && */
        data.children.map((card) => <Card key={card.name} data={card}/>)
      }
    </div>
  )
}


function IconRow({data, details, setDetails}) {

  const setDetailsWrapper = (value) => {
    if (value===details) setDetails('')
    else setDetails(value)
  }
  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        color: "#A49DA7",
        fontSize: "1.3rem",
        gap: '15px',
      }}>
        <LinkedPathogenPageIcon name={data.name}/>
        { data.nDatasets > 1 && (
          <IconContainer
            description="Total number of distinct resource collections (e.g. datasets)"
            Icon={MdOutlineShare}
            text={data.nDatasets}
          />
        )}
        <IconContainer
          description="Total number of available versions"
          Icon={MdCached}
          text={data.nVersions}
          // handleClick={() => setDetailsWrapper('versions')}
        />
        <div>
          {`Last updated: ${data.lastUpdated}`}
        </div>
      </div>
    </>
  )
}

function IconContainer({description, Icon, text, handleClick=undefined, selected=false}) {
  const iconProps = {size: "1.2em"};
  if (selected) iconProps.color = '#4F4B50';
  const hasOnClick = typeof handleClick === 'function';
  return (
    <div
      style={{display: 'flex', alignItems: 'center', gap: '3px', cursor: hasOnClick?'pointer':'auto'}}
      data-tooltip-id="iconTooltip"
      data-tooltip-content={description}
      data-tooltip-place="top"
      onClick={hasOnClick ? handleClick : ()=>{}}
    >
      <Icon {...iconProps}/>
      {text}
    </div>
  )
}

function LinkedPathogenPageIcon({name}) {
  const pages = {
    flu: "/influenza",
    ncov: "/sars-cov-2",
  }
  const p1 = name.split('/')[0]
  if (!pages[p1]) return null;

  return (
    <a
      style={{display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', color: 'inherit', fontWeight: '300'}}
      data-tooltip-id="iconTooltip" data-tooltip-place="top"
      data-tooltip-content="Click to view associated pathogen page"
      href={`https://nextstrain.org${pages[p1]}`}  target="_blank" rel="noreferrer"
    >
      <MdCoronavirus size={"1.2em"}/>
      {pages[p1]}
    </a>
  )
}

function Details({data, view}) {

  if (view==='') return null;

  let content;
  if (view==='narratives') {
    content = 'Narratives which reference this dataset (functionality not yet implemented) would be listed here'
  } else if (view==='versions') {
    if (data.versions?.length) {
      return <Versions card={data}/>
    } else {
      content = 'Currently this viz only implemented for datasets, not intermediates -- try clicking using a card with blue text (which is a dataset card).'
    }
  } else if (view==='datasets') {
    content = 'This should open/close (collapse?) the cards'
  } else if (view==='views') {
    content = ''
  } 

  return (
    <div style={{
      borderTop: "1px solid #ece2f0",
      marginTop: '5px', /* above border */
    }}>
      {content}
    </div>
  )
}

function Versions({card}) {
  return (<div style={{
    borderTop: "1px solid #ece2f0",
    marginTop: '5px', /* above border */
  }}>
    Todo: list versions (prototype used d3 to render)
  </div>);
}

/**
 * <Name> is the element for a collection's title. It may or may not be a link.
 */
function Name({name, url}) {
  const prettyName = name.replace(/\//g, " / ")
  if (!url) return (
    <div
      data-tooltip-id="iconTooltip" data-tooltip-place="top"
      data-tooltip-content={"Not an actual dataset - sort of an internal node in the naming hierarchy"}
    >
      {prettyName}
    </div>
  );
  /* The structure of URLs in the API response is a WIP */
  const href = url.startsWith('http') ?
    url :
    `https://nextstrain.org/${url}`;
  return (
    <a href={href} target="_blank" rel="noreferrer"
      data-tooltip-id="iconTooltip" data-tooltip-place="top"
      data-tooltip-content={"Click to view the (current) dataset"}
      style={{ fontSize: '1.8rem', fontWeight: '300'}}
    >
      {prettyName}
    </a>
  )
}

function Logo(name) {
  /**
   * TODO -- map the resource collection name to a suitable logo.
   * Currently we are only using core datasets
   */
  // return <NextstrainLogo/>
  return <img alt="nextstrain logo" height="35px" src={nextstrainLogo}/>
}
