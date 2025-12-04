"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React from "react";
import ListResources from "../../components/list-resources";
import { listResourcesAPI } from "../../components/list-resources/listResourcesApi";
import { Group } from "../../components/list-resources/types";
import nextstrainLogoSmall from "../../static/logos/nextstrain-logo-small.png";

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

    /* For dataset "community/a/b/c", use "community/a" as the grouping instead
     * of just "community".
     */
    groupNameBuilder: (name: string): string => {
      return name.startsWith("community/")
        ? name.split("/").slice(0, 2).join("/")
        : name.split("/")[0]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    },

    // Sort "community/…" datasets after ours
    groupSortableName: (group: Group): string => {
      const name = group.groupName;
      return name.startsWith("community/") ? `001 ${name}` :
                                             `000 ${name}` ;
    },

    // Add Nextstrain logo for core datasets
    groupImg: (group: Group) => {
      const isOfficialDataset = group.resources.some((r) => !r.name.startsWith('community/'));
      return isOfficialDataset
        ? { src: nextstrainLogoSmall.src, alt: "nextstrain logo" }
        : undefined;
    },
  });
}
