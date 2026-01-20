"use client";
// Note: this is only in a separate file as it needs to be run client side
// and we want to run as much of the parent page server-side as possible.

import React from "react";
import ListResources from "../../components/list-resources";
import { listResourcesAPI } from "../../components/list-resources/listResourcesApi";
import { Group } from "../../components/list-resources/types";
import nextstrainLogoSmall from "../../static/logos/nextstrain-logo-small.png";

const NON_NEXTSTRAIN_COLLECTIONS = ["community", "enpen"];

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

    /* For non-Nextstrain "<collection>/a/b/c", use "<collection>/a" as the
     * grouping instead of just "<collection>".
     */
    groupNameBuilder: (name: string): string => {
      return isNextstrain(name)
        ? name.split("/")[0]!  // eslint-disable-line @typescript-eslint/no-non-null-assertion
        : name.split("/").slice(0, 2).join("/");
    },

    // Sort non-Nextstrain datasets after ours
    groupSortableName: (group: Group): string => {
      const name = group.groupName;
      return isNextstrain(name) ? `000 ${name}` :
                                  `001 ${name}` ;
    },

    // Add Nextstrain logo for core datasets
    groupImg: (group: Group) => {
      const isOfficialDataset = group.resources.some((r) => isNextstrain(r.name));
      return isOfficialDataset
        ? { src: nextstrainLogoSmall.src, alt: "nextstrain logo" }
        : undefined;
    },
  });
}

/**
 * Returns whether a dataset belongs to the "nextstrain" collection.
 *
 * This checks against other collection prefixes because the leading
 * "nextstrain/" prefix is removed from datasets in the "nextstrain"
 * collection.¹
 *
 * ¹ docstring of NextcladeSource in src/sources/nextclade.js
 */
function isNextstrain(name: string): boolean {
  for (const collection of NON_NEXTSTRAIN_COLLECTIONS) {
    if (name.startsWith(`${collection}/`)) {
      return false;
    }
  }
  return true;
}
