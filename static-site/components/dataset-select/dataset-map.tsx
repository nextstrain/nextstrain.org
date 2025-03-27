import React from 'react';
import Map, {Marker, NavigationControl} from 'react-map-gl';
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { remove } from "lodash";
import { FaInfoCircle } from "react-icons/fa";
import "mapbox-gl/dist/mapbox-gl.css";

const MapMarkerContainer = styled.div`
  position: relative;
  text-align: center;
  color: white;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
`;

export const StyledTooltip = styled(ReactTooltip)`
  max-width: 30vh;
  white-space: normal;
  line-height: 1.2;
  padding: 10px !important; /* override internal styling */
  z-index: 1002 !important; /* on top of viz legend */
  pointer-events: auto !important;
`;


const Flex = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 0em 1em 3em 1em;
  @media (max-width: 720px) {
    flex-direction: column;
    margin: 1em 0 3em;
  }
`;

const MapContainer = styled.div`
  max-width: 1080px;
  width: 100%;
  background-color: #fff;
  margin: auto;
  height: 575px;
  padding-top: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  font-size: calc(10px + 2vmin);
  color: ${props => props.theme.primary500};
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: wrap;
  max-width: 35%;
  position: absolute;
  top: 0;
  right: 0;
  margin: 12px;
  background-color: #f9f9f9;
  color: #000000;
  z-index: 1001 !important;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px;
  padding: 6px;
  font-weight: bold;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendLabel = styled.span`
  padding: 4px;
`;

const LegendIconContainer = styled.span`
  padding: 2px;
  cursor: help;
  color: #888;
`;

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidHJ2cmIiLCJhIjoiY2tqcnM5bXIxMWV1eTJzazN2YXVrODVnaiJ9.7iPttR9a_W7zuYlUCfrz6A";

const circle = (size, fill, text) => {
  const sizeAdjusted = size+2;
  const radius = size/2;
  const width = sizeAdjusted/2;
  const fontSize = `${width/12}em`;
  return (<svg height={sizeAdjusted} width={sizeAdjusted}>
    <circle cx={width} cy={width} r={radius*1.1} stroke="white" strokeWidth="1" fill={fill}/>
    {text &&
      <text x={width} y={width*1.1} fill="white" fontSize={fontSize} textAnchor="middle" dominantBaseline="middle">
        {text}
      </text>}
  </svg>);
};


const nextstrainDataset = circle(17, "#4C90C0");
const communityDatasets = {
  region: circle(14, "#75B681"),
  country: circle(12, "#B2BD4D"),
  division: circle(10, "#E1A03A"),
  location: circle(8, "#E04929")
};
const communityDatasetInfo = (level) =>
  `A ${level}-level dataset maintained by a group in the scientific community.
  Not affiliated with Nextstrain.
  More info about these organizations can be found at the links in the dropdown menu below.`;

const legendEntries = [{
  icon: nextstrainDataset,
  label: "Nextstrain dataset",
  id: "nextstrain-dataset",
  info: "A dataset maintained by the Nextstrain team."
},
{
  icon: communityDatasets["region"],
  label: "Regional dataset",
  id: "region-dataset",
  info: communityDatasetInfo("region")
},
{
  icon: communityDatasets["country"],
  label: "National dataset",
  id: "country-dataset",
  info: communityDatasetInfo("country")
},
{
  icon: communityDatasets["division"],
  label: "Divisional dataset",
  id: "division",
  info: communityDatasetInfo("division")
},
{
  icon: communityDatasets["location"],
  label: "Local dataset",
  id: "location-dataset",
  info: communityDatasetInfo("location")
}];

const Legend = (entries) => (
  <LegendContainer>
    {entries.map((legendEntry) => (
      <LegendItem key={legendEntry.id}>
        {legendEntry.icon}
        <LegendLabel>{legendEntry.label}</LegendLabel>
        <LegendIconContainer data-tip data-for={legendEntry.id}>
          <FaInfoCircle/>
        </LegendIconContainer>
        <StyledTooltip place="bottom" type="dark" effect="solid" id={legendEntry.id}>
          {legendEntry.info}
        </StyledTooltip>
      </LegendItem>
    ))}
  </LegendContainer>
);

class DatasetMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoomToIndex: null
    };
  }

  onMapMove() {
    this.setState({zoomToIndex: null});
  }

  MapMarker = (dataset) => {
    const isNextstrainDataset = dataset.org.name === "Nextstrain Team";
    return (
      <Marker
        latitude={dataset.coords[1]}
        longitude={dataset.coords[0]}
        anchor="bottom"
        key={dataset.coords.toString()}
      >
        <MapMarkerContainer>
          <a href={dataset.url} data-tip data-for={dataset.url}>
            {isNextstrainDataset ? nextstrainDataset : communityDatasets[dataset.level]}
          </a>
        </MapMarkerContainer>
      </Marker>);
  }

  MapMarkerTooltip = (dataset) => {
    return (
      <StyledTooltip type="light" key={dataset.url} id={dataset.url} effect="solid">
        {`${dataset.name} (${dataset.org.name})`}
        <div style={{fontStyle: "italic"}}>Click to view</div>
      </StyledTooltip>);
  }

  render() {
    // We don't map the stub datasets that are used to define the hierarchy
    const datasetsToMap = this.props.datasets.filter((dataset) => dataset.url !== undefined && dataset.coords !== undefined && dataset.name !== "Global");
    // Nextstrain datasets handled separately
    const nextstrainDatasets = remove(datasetsToMap, (b) => b.org && b.org.name === "Nextstrain Team");

    return (
      <Flex>
        <MapContainer>
          <Map
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            mapStyle={`https://api.mapbox.com/styles/v1/trvrb/ciu03v244002o2in5hlm3q6w2?access_token=${MAPBOX_ACCESS_TOKEN}`}
            style={{height: "100%", width: "100%"}}
            /* setting `zoom` prop seems to disable <NavigationControl> zooming, but the default (0) is what we want */
            maxBounds={[[-175, -60], [190, 75]]}
            onLoad={ReactTooltip.rebuild}
            onZoomEnd={ReactTooltip.rebuild}
            onDragEnd={ReactTooltip.rebuild}
            renderWorldCopies={false}
          >
            <NavigationControl position='bottom-right' showCompass={false}/>
            {Legend(legendEntries)}
            {datasetsToMap.map((dataset, index) => this.MapMarker(dataset, index))}
            {nextstrainDatasets.map((dataset) => this.MapMarker(dataset))}
            {/* Tooltips for map markers: */}
            {[...nextstrainDatasets, ...datasetsToMap].map((dataset) => this.MapMarkerTooltip(dataset))}
          </Map>
        </MapContainer>
      </Flex>
    );
  }

}

export default DatasetMap;
