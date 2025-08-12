"use client";

import React, { useContext, useEffect, useState } from "react";

import DatasetSelect from "../../../components/dataset-select";
import {
  DatasetSelectColumnsType,
  DatasetType,
} from "../../../components/dataset-select/types";
import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import ListResources from "../../../components/list-resources";
import { ResourceListingInfo } from "../../../components/list-resources/types";
import {
  BigSpacer,
  HugeSpacer,
} from "../../../components/spacers";
import { UserContext } from "../../../components/user-data-wrapper";
import {
  DataFetchError,
} from "../../../data/SiteConfig";
import { fetchAndParseJSON } from "../../../src/util/datasetsHelpers";
import ScrollableAnchor from "../../../vendored/react-scrollable-anchor/index";

import GroupTiles from "./group-tiles";

const datasetColumns: DatasetSelectColumnsType[] = [
  {
    name: "Narrative",
    value: (d) => d.url.replace("/groups/", "").replace(/\//g, " / "),
    url: (d) => d.url,
  },
  {
    name: "Group Name",
    value: (d) => d.url.split("/")[2] || "",
    url: (d) => `/groups/${d.url.split("/")[2]}`,
  },
];

/**
 * A React Client Component that fetches and then lists all the groups
 * available to a user, using both a <GroupTiles> component for a
 * tile-based view of the groups, a <ListResources> component for a
 * card-based view of available datasets within the groups, and a
 * <DatasetSelect> component for a list-based view of available
 * narratives within the groups.
 */
export default function GroupListingPage(): React.ReactElement {
  const { user } = useContext(UserContext);

  /** flag for whether data is loaded yet */
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  /** flag for any errors seen while fetching data */
  const [errorFetchingData, setErrorFetchingData] = useState<boolean>(false);
  /** state to hold available narratives */
  const [narratives, setNarratives] = useState<DatasetType[]>([]);

  useEffect((): void => {
    async function fetchData(): Promise<void> {
      try {
        const available = await fetchAndParseJSON(
          "/charon/getAvailable?prefix=/groups",
        );
        setNarratives(_cleanUpAvailable(available["narratives"]));
        setDataLoaded(true);
      } catch (err) {
        console.error(
          "Error fetching / parsing data.",
          err instanceof Error ? err.message : String(err),
        );
        setErrorFetchingData(true);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h2 className="centered">Available groups</h2>
      <FlexCenter>
        <FocusParagraphCentered>
          Click on any tile to view the different datasets and narratives
          available for that group.{" "}
          {user ? (
            <>
              A padlock icon indicates a private group which you (
              {user.username}) have access to.
            </>
          ) : (
            <>
              These groups are all public, to see private groups please{" "}
              <a href="/login">log in</a>.
            </>
          )}
        </FocusParagraphCentered>
      </FlexCenter>

      {/* These tiles don't go nicely into FlexCenter as they manage their own spacing */}
      <GroupTiles />

      <HugeSpacer />

      <h2 className="centered">Available Datasets</h2>

      <BigSpacer />

      <ListResources
        resourceType="dataset"
        versioned={false}
        resourceListingCallback={_resourceListingCallback}
      />

      <HugeSpacer />

      <ScrollableAnchor id={"narratives"}>
        <h2 className="centered">Available Narratives</h2>
      </ScrollableAnchor>

      {dataLoaded && (
        <DatasetSelect
          datasets={narratives}
          columns={datasetColumns}
          title={"Filter Narratives"}
        />
      )}

      {errorFetchingData && (
        <FocusParagraphCentered>
          <DataFetchError />
        </FocusParagraphCentered>
      )}
    </>
  );
}

function _cleanUpAvailable(datasets: { request: string }[]): DatasetType[] {
  /** The dataset display & filtering has a number of hard-coded
   * assumptions and TODOs, which requires us to coerce dataset lists
   * into a specific format
   */
  if (!datasets) return [];

  return datasets.map(
    (d: { request: string }): DatasetType => ({
      ...d,
      filename: d.request.replace(/\//g, "_").replace(/^_/, ""),
      url: d.request,
    }),
  );
}

// It is unfortunate that this method repeats the request to
// `charon/getAvailable?prefix=/groups/` that we're already making
// above in the `useEffect()` hook. Ideally we could make that request
// once, and re-use the response.
//   - jsja, 08 Aug 2025
async function _resourceListingCallback(): Promise<ResourceListingInfo> {
  const sourceUrl = "/charon/getAvailable?prefix=/groups/";

  try {
    const response = await fetchAndParseJSON(sourceUrl);

    const datasets: { request: string }[] = response["datasets"];

    // Use an empty array as the value side, to indicate that there are
    // no dated versions associated with this data
    // const pathVersions: Record<string, string[]> = Object.assign(
    const pathVersions = Object.assign(
      {},
      ...datasets.map((ds) => ({
        [ds.request.replace(/^\/groups\//, "")]: [],
      })),
    );

    return { pathPrefix: "groups/", pathVersions };
  } catch (err) {
    const message = `fetching data from "${sourceUrl}" failed`;
    console.error(message, err instanceof Error ? err.message : String(err));
    throw new Error(message);
  }
}
