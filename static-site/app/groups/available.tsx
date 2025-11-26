"use client";

import React, { useContext, useEffect, useState } from "react";

import DatasetSelect from "../../components/dataset-select";
import {
  DatasetSelectColumnsType,
  DatasetType,
} from "../../components/dataset-select/types";
import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import ListResources from "../../components/list-resources";
import { Group, Resource} from "../../components/list-resources/types";
import { BigSpacer, HugeSpacer } from "../../components/spacers";
import { UserContext } from "../../components/user-data-wrapper";
import { DataFetchError } from "../../data/SiteConfig";
import fetchAndParseJSON from "../../util/fetch-and-parse-json";
import ScrollableAnchor from "../../vendored/react-scrollable-anchor/index";

import GroupTiles from "./group-tiles";

import type { AvailableGroups, DataResource } from "./types";

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
export default function Available(): React.ReactElement {
  const { user } = useContext(UserContext);

  /** flag for whether data is loaded yet */
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  /** flag for any errors seen while fetching data */
  const [errorFetchingData, setErrorFetchingData] = useState<boolean>(false);
  /** state to hold available datasets */
  const [datasets, setDatasets] = useState<DataResource[]>([]);
  /** state to hold available narratives */
  const [narratives, setNarratives] = useState<DatasetType[]>([]);

  useEffect((): void => {
    async function fetchData(): Promise<void> {
      try {
        const available = await fetchAndParseJSON<AvailableGroups>(
          "/charon/getAvailable?prefix=/groups",
        );
        setDatasets(available.datasets);
        setNarratives(_cleanUpAvailable(available.narratives));
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

  // NOTE: "group" has two meanings here - a nextstrain group and a group of
  // resources for listing. Luckily for us the "group name" is the same for both
  async function resourcesCallback(): Promise<Group[]> {
    /* Convert the API response structure into `Group[]` */
    const resources = datasets.flatMap((dataset): Resource[] => {
      const parts = dataset.request.split('/').slice(1);
      const groupName = parts[1]
      if (parts[0] !== "groups" || groupName === undefined) return [];
      const name = parts.slice(2).join('/');
      return [{
        name,
        groupName,
        nameParts: name.split('/'),
        sortingName: name,
        url: dataset.request,
      }];
    });

    const groups = Array.from(new Set(resources.map((r) => r.groupName)))
      .map((groupName): Group => {
        const filteredResources = resources.filter((r) => r.groupName===groupName);
        return {
          groupName,
          groupDisplayName: groupName,
          groupUrl: `/groups/${groupName}`,
          groupUrlTooltip: `Click to view the page for ${groupName}`,
          resources: filteredResources,
          nResources: filteredResources.length,
          nVersions: undefined,
          lastUpdated: undefined,
        }
      });
    return groups;
  }

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
        fetchResourceGroups={resourcesCallback}
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

function _cleanUpAvailable(datasets: DataResource[]): DatasetType[] {
  /** The dataset display & filtering has a number of hard-coded
   * assumptions and TODOs, which requires us to coerce dataset lists
   * into a specific format
   */
  if (!datasets) return [];

  return datasets.map(
    (d: DataResource): DatasetType => ({
      ...d,
      filename: d.request.replace(/\//g, "_").replace(/^_/, ""),
      url: d.request,
    }),
  );
}
