"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React, { useEffect, useState } from "react";
import ListResources from "../../../components/list-resources";
import { Group } from "../../../components/list-resources/types";
import { listResourcesAPI } from "../../../components/list-resources/listResourcesApi";
import * as coreResources from "../../../content/resource-listing.yaml";
import Spinner from "../../../components/spinner";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import { DataFetchError } from "../../../data/SiteConfig";


/**
 * A React Client Component which wraps the ListResources component to list
 * resources for core nextstrain datasets, including versioning and hardcoded
 * niceties such as quick-links and "featured" tiles.
 */
export default function CorePathogenResourceListing(): React.ReactElement {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorFetchingData, setErrorFetchingData] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const opts = {
          versioned: true,
          groupDisplayNames: coreResources["coreGroupDisplayNames"],
          groupUrl: (groupName: string) => `/${groupName}`,
          groupUrlTooltip: (groupName: string) => `Click to load the default (and most recent) analysis for ${coreResources["coreGroupDisplayNames"][groupName] || groupName}`,
        };
        const result = await listResourcesAPI('core', 'dataset', opts);
        setGroups(result);
        setLoading(false);
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

  if (loading) {
    return <div><Spinner /></div>;
  }

  if (errorFetchingData) {
    return (
      <FocusParagraphCentered>
        <DataFetchError />
      </FocusParagraphCentered>
    );
  }

  return (
    <ListResources
      quickLinks={coreResources["coreQuickLinks"]}
      resourceType="dataset"
      tileData={coreResources["coreTiles"]}
      versioned
      groups={groups}
    />
  )
}
