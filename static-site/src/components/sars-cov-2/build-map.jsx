import React from 'react';
import ReactMapboxGl, { ZoomControl, Marker } from "react-mapbox-gl";
import isTouchDevice from "is-touch-device";
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { zipObject } from "lodash";
import { FlexGridLeft } from "../../layouts/generalComponents";
import nextstrainLogo from '../../../static/logos/nextstrain-logo-small.png';

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
  z-index: 1001 !important; /* on top of viz legend */
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
  width: 600px;
  @media (max-width: 720px) {
    width: 100%;
  }
  @media (max-width: 1080px) {
    width: 400px;
  }
  background-color: #fff;
  margin: auto;
  height: 470px;
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
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  margin: 12px;
  background-color: #404040;
  color: #ffffff;
  z-index: 1002 !important;
  padding: 6px;
  font-weight: bold;
`;

const mapDefaults = {
  center: [0, 40],
  maxBounds: [[-180, -90], [180, 90]],
  zoomOverall: 0,
  zoomPin: 3,
  minZoom: 0
};

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoidHJ2cmIiLCJhIjoiY2pyM3p4aTlmMWMwbjRibzlia3MyMjZhYiJ9.JCLCk3g-GiVOcKiNWGjOXA",
  minZoom: mapDefaults.minZoom,
  scrollZoom: false,
  dragPan: !isTouchDevice()
});

const circle = (fill) => (
  <svg height="30" width="30">
    <circle cx="15" cy="11" r="10" stroke="white" strokeWidth="1" fill={fill} />
  </svg>
);

const regions = ["Africa", "Asia", "Europe", "Middle East", "North America", "Oceania", "South America"];
const colors = ["#3F63CF", "#529AB6", "#75B681", "#A6BE55", "#D4B13F", "#E68133", "#DC2F24"];
const colorScale = zipObject(regions, colors);

const Legend = () => (
  <FlexGridLeft style={{width: 500}}>
    {Object.entries(colorScale).map((regionColor) => (
      <div>
        {circle(regionColor[1])}
        {regionColor[0]}
      </div>
    ))}
  </FlexGridLeft>
);

class BuildMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoomToIndex: null
    };
  }

  onMarkerClick(buildIndex) {
    this.setState({zoomToIndex: buildIndex});
  }

  onMapMove() {
    this.setState({zoomToIndex: null});
  }

  MapMarker = (build, index) => {
    const isNextstrainBuild = build.org.name === "Nextstrain Team";
    return (<div>
      <Marker
        key={index}
        coordinates={build.coords}
        anchor="bottom"
        onClick={() => this.onMarkerClick(index)}
      >
        <MapMarkerContainer data-tip data-for={build.url} data-delay-hide="1000">
          {isNextstrainBuild ?
            <img alt="marker"
              width="30px"
              height="auto"
              src={nextstrainLogo}
            />
            :
            circle(colorScale[build.region] || "black")
          }
        </MapMarkerContainer>
      </Marker>
      <StyledTooltip type="light" id={build.url} effect="solid" data-delay-hide={1000}>
        <a href={build.url}>{build.name}</a>
        {" ("}
        {isNextstrainBuild ?
          "Nextstrain Team" :
          <a href={build.org.url}>{build.org.name}</a>
        }
        {")"}
      </StyledTooltip>
    </div>
    );
  }

  render() {
    let center, zoom;
    // We don't map the stub builds that are used to define the hierarchy
    const buildsToMap = this.props.builds.filter((build) => build.url !== null && build.coords !== undefined);
    if (this.state.zoomToIndex !== null) {
      /* map focused on one pin */
      center = buildsToMap[this.state.zoomToIndex].coords;
      zoom = buildsToMap[this.state.zoomToIndex].zoom || mapDefaults.zoomPin;
    } else {
      /* "overall" view */
      zoom = mapDefaults.zoomOverall;
      center = mapDefaults.center;
    }

    return (
      <Flex>
        <MapContainer>
          <Map
            style="mapbox://styles/mapbox/streets-v9" // eslint-disable-line
            containerStyle={{height: "100%", width: "100%"}}
            center={center}
            zoom={[zoom]}
            maxBounds={mapDefaults.maxBounds}
            // onDragEnd={() => this.onMapMove()}
          >
            <LegendContainer id="legend">
              <Legend />
            </LegendContainer>
            {buildsToMap.map((build, index) => this.MapMarker(build, index))}
            <ZoomControl zoomDiff={1.0}/>
          </Map>
        </MapContainer>
      </Flex>
    );
  }

}

export default BuildMap;
