"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React from "react";
import ListResources from "../../../components/list-resources";
import { listResourcesAPI } from "../../../components/list-resources/listResourcesApi";

export default function NextcladeResourceListing(): React.ReactElement {
  return (
    <ListResources
      quickLinks={[]}
      resourceType="dataset"
      tileData={[]}
      versioned={true}
      fetchResourceGroups={nextcladeDatasetResourceGroups}
    />
  )
}

async function nextcladeDatasetResourceGroups() {
  return await listResourcesAPI('nextclade', 'dataset', {
    versioned: true,
    groupNameBuilder: (name: string): string => {
      return name.startsWith("community/")
        ? name.split("/").slice(0, 2).join("/")
        : name.split("/")[0];
    },
  });
}
