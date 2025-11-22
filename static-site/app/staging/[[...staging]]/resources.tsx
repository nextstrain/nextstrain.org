"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React, { useEffect, useState } from "react";
import ListResources from "../../../components/list-resources";
import { Group } from "../../../components/list-resources/types";
import { listResourcesAPI } from "../../../components/list-resources/listResourcesApi";
import Spinner from "../../../components/spinner";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import { DataFetchError } from "../../../data/SiteConfig";

export default function StagingPathogenResourceListing(): React.ReactElement {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorFetchingData, setErrorFetchingData] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const opts = {versioned: false};
        const result = await listResourcesAPI('staging', 'dataset', opts);
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
      quickLinks={[]}
      resourceType="dataset"
      tileData={[]}
      versioned={false}
      groups={groups}
    />
  )
}
