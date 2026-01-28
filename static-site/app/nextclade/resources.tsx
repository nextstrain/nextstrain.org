"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React from "react";
import ListResources from "../../components/list-resources";
import { listResourcesAPI } from "../../components/list-resources/listResourcesApi";
import { Group } from "../../components/list-resources/types";

interface NextcladeIndex {
  collections?: Array<{ meta?: { id?: string, icon?: string } }>;
}

// The Nextclade index file contains information for all resource groups, so it
// only needs to be fetched once.
let nextcladeIndexCache: Promise<NextcladeIndex | null> | undefined = undefined;

async function getNextcladeIndex(): Promise<NextcladeIndex | null> {
  if (nextcladeIndexCache) return nextcladeIndexCache;

  nextcladeIndexCache = (async () => {
    try {
      const response = await fetch("https://data.clades.nextstrain.org/v3/index.json");
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  })();

  return nextcladeIndexCache;
}

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

    /* For dataset "<collection>/a/b/c", use "<collection>/a" as the grouping
     * instead of just the collection name.
     */
    groupNameBuilder: (name: string): string => {
      return name.split("/").slice(0, 2).join("/");
    },

    // Show "nextstrain/…" datasets first
    groupSortableName: (group: Group): string => {
      const name = group.groupName;
      return name.startsWith("nextstrain/") ? `000 ${name}` :
                                              `001 ${name}` ;
    },

    // Use icon from Nextclade index
    groupImg: async (group: Group) => {
      const collection = group.groupName.split("/")[0];
      if (!collection) return undefined;

      const nextcladeIndex = await getNextcladeIndex();
      const icon = nextcladeIndex?.collections?.find(c => c.meta?.id === collection)?.meta?.icon;
      if (!icon) return undefined;

      return {
        src: `https://data.clades.nextstrain.org/v3/${icon}`,
        alt: `icon for "${collection}" Nextclade dataset collection`
      };
    },
  });
}
