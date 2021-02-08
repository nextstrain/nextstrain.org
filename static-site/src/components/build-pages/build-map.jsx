import React from 'react';
import ReactMapboxGl, { ZoomControl, Marker, Cluster } from "react-mapbox-gl";
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { remove } from "lodash";
import { FaInfoCircle } from "react-icons/fa";

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
  max-width: 1080px;
  @media (max-width: 1080px) {
    max-width: 100vw;
  }
  @media (max-width: 720px) {
    flex-direction: column;
    max-width: 100vw;
    margin: 1em 0 3em;
  }
`;

const MapContainer = styled.div`
  max-width: 1080px;
  width: 100%;
  background-color: #fff;
  margin: auto;
  height: 515px;
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
  left: 0;
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

const mapDefaults = {
  center: [0, 20],
  maxBounds: [[-180, -85], [180, 85]],
  zoomOverall: 0,
  zoomPin: 3,
  minZoom: 0
};

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoidHJ2cmIiLCJhIjoiY2pyM3p4aTlmMWMwbjRibzlia3MyMjZhYiJ9.JCLCk3g-GiVOcKiNWGjOXA",
  minZoom: mapDefaults.minZoom,
  scrollZoom: false
});

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


const nextstrainBuild = circle(17, "#4C90C0");
const communityBuilds = {
  region: circle(14, "#75B681"),
  country: circle(12, "#B2BD4D"),
  division: circle(10, "#E1A03A"),
  location: circle(8, "#E04929")
};
const communityBuildInfo = (level) =>
  `A ${level}-level build maintained by a group in the scientific community.
  Not affiliated with Nextstrain.
  More info about these organizations can be found at the links in the dropdown menu below.`;

const legendEntries = [{
  icon: nextstrainBuild,
  label: "Nextstrain build",
  id: "nextstrain-build",
  info: "A build maintained by the Nextstrain team."
},
{
  icon: communityBuilds["region"],
  label: "Regional build",
  id: "region-build",
  info: communityBuildInfo("region")
},
{
  icon: communityBuilds["country"],
  label: "National build",
  id: "country-build",
  info: communityBuildInfo("country")
},
{
  icon: communityBuilds["division"],
  label: "Divisional build",
  id: "division",
  info: communityBuildInfo("division")
},
{
  icon: communityBuilds["location"],
  label: "Local build",
  id: "location-build",
  info: communityBuildInfo("location")
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

class BuildMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoomToIndex: null
    };
  }

  onMapMove() {
    this.setState({zoomToIndex: null});
  }

  ClusterMarker = (coordinates, pointCount) => {
    const size = pointCount < 10 ? 20 : pointCount < 50 ? 30 : 40;
    return (
      <Marker
        key={coordinates.toString()}
        coordinates={coordinates}
      >
        <MapMarkerContainer data-tip data-for={"cluster-tooltip"}>
          {circle(size, "grey", pointCount)}
        </MapMarkerContainer>
      </Marker>);
  };

  MapMarker = (build) => {
    const isNextstrainBuild = build.org.name === "Nextstrain Team";
    return (
      <Marker
        coordinates={build.coords}
        anchor="bottom"
        key={build.coords.toString()}
      >
        <MapMarkerContainer>
          <a href={build.url} data-tip data-for={build.url} build={build}>
            {isNextstrainBuild ? nextstrainBuild : communityBuilds[build.level]}
          </a>
        </MapMarkerContainer>
      </Marker>);
  }

  MapMarkerTooltip = (build) => {
    return (
      <StyledTooltip type="light" key={build.url} id={build.url} effect="solid">
        {`${build.name} (${build.org.name})`}
        {build.updated && <div>{`Dataset updated: ${build.updated}`}</div>}
        <div style={{fontStyle: "italic"}}>Click to view</div>
      </StyledTooltip>);
  }

  render() {
    const center = mapDefaults.center;
    const zoom = mapDefaults.zoomOverall;
    // We don't map the stub builds that are used to define the hierarchy
    const buildsToMap = this.props.builds.filter((build) => build.url !== undefined && build.coords !== undefined && build.name !== "Global");
    // Nextstrain builds go separate from clustered community builds on the map
    const nextstrainBuilds = remove(buildsToMap, (b) => b.org && b.org.name === "Nextstrain Team");

    return (
      <Flex>
        <MapContainer>
          <Map
            style="https://api.mapbox.com/styles/v1/trvrb/ciu03v244002o2in5hlm3q6w2?access_token=pk.eyJ1IjoidHJ2cmIiLCJhIjoiY2l1MDRoMzg5MDEwbjJvcXBpNnUxMXdwbCJ9.PMqX7vgORuXLXxtI3wISjw" // eslint-disable-line
            containerStyle={{height: "100%", width: "100%"}}
            center={center}
            zoom={[zoom]}
            maxBounds={mapDefaults.maxBounds}
            onZoomEnd={ReactTooltip.rebuild}
            onDragEnd={ReactTooltip.rebuild}
          >
            <ZoomControl zoomDiff={1.0} style={{top: "auto", bottom: "15px", right: "10px"}}/>
            {Legend(legendEntries)}
            {/* Clustering of community builds according to https://github.com/alex3165/react-mapbox-gl/blob/master/docs/API.md#cluster */}
            <Cluster ClusterMarkerFactory={this.ClusterMarker} zoomOnClick zoomOnClickPadding={200} maxZoom={5} radius={30}>
              {buildsToMap.map((build, index) => this.MapMarker(build, index))}
            </Cluster>
            {/* Tooltips for cluster markers: */}
            <StyledTooltip type="light" id={"cluster-tooltip"} effect="solid">
              <div style={{fontStyle: "italic"}}>Click to zoom on this cluster of builds</div>
            </StyledTooltip>
            {/* Nextstrain builds: */}
            {nextstrainBuilds.map((build) => this.MapMarker(build))}
            {/* Tooltips for map markers: */}
            {[...nextstrainBuilds, ...buildsToMap].map((build) => this.MapMarkerTooltip(build))}
          </Map>
        </MapContainer>
      </Flex>
    );
  }

}

export default BuildMap;
