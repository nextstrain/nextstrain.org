"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React from "react";
import ListResources from "../../components/list-resources";
import { listResourcesAPI } from "../../components/list-resources/listResourcesApi";

export default function StagingPathogenResourceListing(): React.ReactElement {
  return (
    <ListResources
      quickLinks={[]}
      resourceType="dataset"
      tileData={[]}
      versioned={false}
      fetchResourceGroups={stagingDatasetResourceGroups}
    />
  )
}

async function stagingDatasetResourceGroups() {
  const opts = {versioned: false};
  return await listResourcesAPI('staging', 'dataset', opts);
}