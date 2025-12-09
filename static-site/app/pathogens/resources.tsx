"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React from "react";
import ListResources from "../../components/list-resources";
import { listResourcesAPI } from "../../components/list-resources/listResourcesApi";
import { coreResources } from "../../content/resource-listing";


/**
 * A React Client Component which wraps the ListResources component to list
 * resources for core nextstrain datasets, including versioning and hardcoded
 * niceties such as quick-links and "featured" tiles.
 */
export default function CorePathogenResourceListing(): React.ReactElement {
  return (
    <ListResources
      quickLinks={coreResources["coreQuickLinks"]}
      resourceType="dataset"
      tileData={coreResources["coreTiles"]}
      versioned
      fetchResourceGroups={_coreDatasetResourceGroups}
    />
  )
}

async function _coreDatasetResourceGroups() {
  const opts = {
    versioned: true,
    groupDisplayNames: coreResources["coreGroupDisplayNames"],
    groupUrl: (groupName: string) => `/${groupName}`,
    groupUrlTooltip: (groupName: string) => `Click to load the default (and most recent) analysis for ${coreResources["coreGroupDisplayNames"][groupName] || groupName}`,
  };
  return await listResourcesAPI('core', 'dataset', opts);
}