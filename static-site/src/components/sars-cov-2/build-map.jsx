import React from 'react';
import ReactMapboxGl, { ZoomControl, Marker } from "react-mapbox-gl";
import isTouchDevice from "is-touch-device";
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { sortBy } from "lodash";
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
  width: 100%;
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
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  max-width: 30%;
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

const LegendItem = styled.div`
  padding: 4px;
`;

const LegendLabel = styled.span`
  padding: 4px;
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

const circle = (size, fill) => (
  <svg height={size+2} width={size+2}>
    <circle cx={(size+2)/2} cy={(size+2)/2} r={size/2} stroke="white" strokeWidth="1" fill={fill} />
  </svg>
);

const NextstrainLogo = (size) => (
  <img alt="marker"
    width={`${size}px`}
    height="auto"
    src={nextstrainLogo}
  />
);

const communityBuildColor = "#529AB6";

const Legend = () => (
  <LegendContainer>
    <LegendItem>
      {NextstrainLogo(20)}
      <LegendLabel>Nextstrain build</LegendLabel>
    </LegendItem>
    <LegendItem>
      {circle(10, communityBuildColor)}
      <LegendLabel>Community build</LegendLabel>
    </LegendItem>
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

  MapMarker = (build, index) => {
    const isNextstrainBuild = build.org.name === "Nextstrain Team";
    return (<div key={index}>
      <Marker
        coordinates={build.coords}
        anchor="bottom"
      >
        <MapMarkerContainer data-tip data-for={build.url} data-delay-hide="500">
          <a href={build.url}>
            {isNextstrainBuild ?
              <img alt="marker"
                width="20px"
                height="auto"
                src={nextstrainLogo}
              />
              :
              circle(10, communityBuildColor)
            }
          </a>
        </MapMarkerContainer>
      </Marker>
      <StyledTooltip type="light" id={build.url} effect="solid" data-delay-hide={500}>
        {`${build.name} (${build.org.name})`}
      </StyledTooltip>
    </div>
    );
  }

  render() {
    let center, zoom;
    const buildsToMap = sortBy(
      // We don't map the stub builds that are used to define the hierarchy
      this.props.builds.filter((build) => build.url !== null && build.coords !== undefined),
      // Nextstrain builds are last so they show up on top
      (b) => b.org && b.org.name === "Nextstrain Team");
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
            <ZoomControl class="zoomcontrolz" zoomDiff={1.0} style={{top: "auto", bottom: "15px", right: "10px"}}/>
            <Legend />
            {buildsToMap.map((build, index) => this.MapMarker(build, index))}
          </Map>
        </MapContainer>
      </Flex>
    );
  }

}

export default BuildMap;
