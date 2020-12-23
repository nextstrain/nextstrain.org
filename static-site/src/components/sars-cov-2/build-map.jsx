import React from 'react';
import ReactMapboxGl, { ZoomControl, Marker } from "react-mapbox-gl";
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
import { sortBy } from "lodash";
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
  flex-direction: row;
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
  padding: 4px;
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

const circle = (size, fill) => (
  <svg height={size+2} width={size+2}>
    <circle cx={(size+2)/2} cy={(size+2)/2} r={size/2} stroke="white" strokeWidth="1" fill={fill} />
  </svg>
);

const nextstrainColor = "#5DA8A3";
const communityBuildColor = "#529AB6";

const legendEntries = [{
  icon: circle(15, nextstrainColor),
  label: "Nextstrain build",
  id: "nextstrain-build",
  info: "A build maintained by the Nextstrain team."
},
{
  icon: circle(10, communityBuildColor),
  label: "Community build",
  id: "community-build",
  info: `A build maintained by a group in the scientific community.
    Not affiliated with Nextstrain.
    More info about these organizations can be found at the links in the dropdown menu below.`
}];

const Legend = (entries) => (
  <LegendContainer>
    {entries.map((legendEntry) => (
      <LegendItem>
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
              circle(15, nextstrainColor)
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
      this.props.builds.filter((build) => build.url !== null && build.coords !== undefined && build.name !== "Global"),
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
            style="https://api.mapbox.com/styles/v1/trvrb/ciu03v244002o2in5hlm3q6w2?access_token=pk.eyJ1IjoidHJ2cmIiLCJhIjoiY2l1MDRoMzg5MDEwbjJvcXBpNnUxMXdwbCJ9.PMqX7vgORuXLXxtI3wISjw" // eslint-disable-line
            containerStyle={{height: "100%", width: "100%"}}
            center={center}
            zoom={[zoom]}
            maxBounds={mapDefaults.maxBounds}
            // onDragEnd={() => this.onMapMove()}
          >
            <ZoomControl zoomDiff={1.0} style={{top: "auto", bottom: "15px", right: "10px"}}/>
            {Legend(legendEntries)}
            {buildsToMap.map((build, index) => this.MapMarker(build, index))}
          </Map>
        </MapContainer>
      </Flex>
    );
  }

}

export default BuildMap;
