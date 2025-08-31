"use client";

import { ResourceListingInfo } from "../../../components/list-resources/types";

/**
 * A callback function used by the <ListResources> component (which
 *  see) to get the resources to display on the /staging page.
 */
export async function stagingResourceListingCallback(): Promise<ResourceListingInfo> {
  const sourceId = "staging";
  const sourceUrl = `/list-resources/${sourceId}/dataset`;

  const response = await fetch(sourceUrl, {
    headers: { accept: "application/json" },
  });
  if (response.status !== 200) {
    throw new Error(
      `fetching data from "${sourceUrl}" returned status code ${response.status}`,
    );
  }

  return (await response.json()).dataset[sourceId];
}
