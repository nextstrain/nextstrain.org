"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React from "react";
import ListResources from "../../../components/list-resources";
import { listResourcesAPI } from "../../../components/list-resources/listResourcesApi";
import * as coreResources from "../../../content/resource-listing.yaml";

export default function CorePathogenResourceListing(): React.ReactElement {
  return (
    <ListResources
      resourceType="intermediate"
      tileData={coreResources["coreTiles"]}
      versioned={false}
      fetchResourceGroups={coreDatasetResourceGroups}
    />
  )
}

async function coreDatasetResourceGroups() {
  const opts = {
    versioned: false,
    groupDisplayNames: coreResources["coreGroupDisplayNames"],
  };
  return await listResourcesAPI('core', 'intermediate', opts);
}