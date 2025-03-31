"use client";

import React from "react";

import { remove } from "lodash";
import { FaInfoCircle } from "react-icons/fa";
import Map, { Marker, NavigationControl } from "react-map-gl";
import ReactTooltip from "react-tooltip";

import StyledTooltip from "./styled-tooltip";
import { DatasetType, LegendEntryType } from "./types";

import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./dataset-map.module.css";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoidHJ2cmIiLCJhIjoiY2tqcnM5bXIxMWV1eTJzazN2YXVrODVnaiJ9.7iPttR9a_W7zuYlUCfrz6A";

/** A React Client Compoment to display datasets on a global map */
export default function DatasetMap({
  datasets,
}: {
  /** The datasets to display */
  datasets: DatasetType[];
}): React.ReactElement {
  // We don't map the stub datasets that are used to define the hierarchy
  const datasetsToMap = datasets.filter(
    (dataset) =>
      dataset.url !== undefined &&
      dataset.coords !== undefined &&
      dataset.name !== "Global",
  );

  // Nextstrain datasets handled separately
  const nextstrainDatasets: DatasetType[] = remove(
    datasetsToMap,
    (b: DatasetType) => b.org && b.org.name === "Nextstrain Team",
  );

  return (
    <div className={styles.flex}>
      <div className={styles.mapContainer}>
        <Map
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={`https://api.mapbox.com/styles/v1/trvrb/ciu03v244002o2in5hlm3q6w2?access_token=${MAPBOX_ACCESS_TOKEN}`}
          style={{ height: "100%", width: "100%" }}
          /* setting `zoom` prop seems to disable <NavigationControl> zooming, but the default (0) is what we want */
          maxBounds={[
            [-175, -60],
            [190, 75],
          ]}
          onLoad={ReactTooltip.rebuild}
          onZoomEnd={ReactTooltip.rebuild}
          onDragEnd={ReactTooltip.rebuild}
          renderWorldCopies={false}
        >
          <NavigationControl position="bottom-right" showCompass={false} />
          {Legend(legendEntries)}

          {datasetsToMap.map(
            (dataset): React.ReactElement => MapMarker(dataset),
          )}

          {nextstrainDatasets.map(
            (dataset): React.ReactElement => MapMarker(dataset),
          )}

          {/* Tooltips for map markers: */}
          {[...nextstrainDatasets, ...datasetsToMap].map((dataset) =>
            MapMarkerTooltip(dataset),
          )}
        </Map>
      </div>
    </div>
  );
}

/** helper function to make SVG circle components */
function circle(
  /** Size in pixels */
  size: number,

  /** Fill color */
  fill: string,

  /** A label for the circle */
  text?: string,
): React.ReactElement {
  const sizeAdjusted = size + 2;
  const radius = size / 2;
  const width = sizeAdjusted / 2;
  const fontSize = `${width / 12}em`;

  return (
    <svg height={sizeAdjusted} width={sizeAdjusted}>
      <circle
        cx={width}
        cy={width}
        r={radius * 1.1}
        stroke="white"
        strokeWidth="1"
        fill={fill}
      />
      {text && (
        <text
          x={width}
          y={width * 1.1}
          fill="white"
          fontSize={fontSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {text}
        </text>
      )}
    </svg>
  );
}

/** Legend element for Nextstrain-maintained datasets */
const nextstrainDataset = circle(17, "#4C90C0");

/** Legend elements for community datasets at different geographical scopes */
const communityDatasets = {
  region: circle(14, "#75B681"),
  country: circle(12, "#B2BD4D"),
  division: circle(10, "#E1A03A"),
  location: circle(8, "#E04929"),
};

/** Helper function for community dataset tooltips */
function communityDatasetInfo(
  /** The geographic scope of the dataset */
  level: string,
): string {
  return `A ${level}-level dataset maintained by a group in the scientific community.
  Not affiliated with Nextstrain.
  More info about these organizations can be found at the links in the dropdown menu below.`;
}

/** Entries to display in the map legend */
const legendEntries: LegendEntryType[] = [
  {
    icon: nextstrainDataset,
    label: "Nextstrain dataset",
    id: "nextstrain-dataset",
    info: "A dataset maintained by the Nextstrain team.",
  },
  {
    icon: communityDatasets["region"],
    label: "Regional dataset",
    id: "region-dataset",
    info: communityDatasetInfo("region"),
  },
  {
    icon: communityDatasets["country"],
    label: "National dataset",
    id: "country-dataset",
    info: communityDatasetInfo("country"),
  },
  {
    icon: communityDatasets["division"],
    label: "Divisional dataset",
    id: "division",
    info: communityDatasetInfo("division"),
  },
  {
    icon: communityDatasets["location"],
    label: "Local dataset",
    id: "location-dataset",
    info: communityDatasetInfo("location"),
  },
];

/** A React Client Component for the map legend */
function Legend(
  /** Entries in the legend */
  entries: LegendEntryType[],
): React.ReactElement {
  return (
    <div className={styles.legendContainer}>
      {entries.map((legendEntry) => (
        <div className={styles.legendItem} key={legendEntry.id}>
          {legendEntry.icon}
          <span className={styles.legendLabel}>{legendEntry.label}</span>
          <span
            className={styles.legendIconContainer}
            data-tip
            data-for={legendEntry.id}
          >
            <FaInfoCircle />
          </span>
          <StyledTooltip delayShow={0} id={legendEntry.id} place="bottom">
            {legendEntry.info}
          </StyledTooltip>
        </div>
      ))}
    </div>
  );
}

/** A marker on the map */
function MapMarker(
  /** The dataset being mapped */
  dataset: DatasetType,
): React.ReactElement {
  const isNextstrainDataset = dataset.org?.name === "Nextstrain Team";

  if (!dataset.coords) {
    throw new Error(`Dataset ${dataset.name} lacks coords!`);
  }

  const [longitude, latitude] = dataset.coords;

  if (!dataset.level) {
    throw new Error(`Dataset ${dataset.name} lacks level!`);
  }

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="bottom"
      key={dataset.coords.toString()}
    >
      <div className={styles.mapMarkerContainer}>
        <a href={dataset.url} data-tip data-for={dataset.url}>
          {isNextstrainDataset
            ? nextstrainDataset
            : communityDatasets[dataset.level]}
        </a>
      </div>
    </Marker>
  );
}

/** Tooltip for a dataset marked on the map */
function MapMarkerTooltip(
  /** The dataset being marked */
  dataset: DatasetType,
): React.ReactElement {
  return (
    <StyledTooltip id={dataset.url} key={dataset.url} type="light">
      <>
        {`${dataset.name} (${dataset.org?.name})`}
        <div style={{ fontStyle: "italic" }}>Click to view</div>
      </>
    </StyledTooltip>
  );
}
