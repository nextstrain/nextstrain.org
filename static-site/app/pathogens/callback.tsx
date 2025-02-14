import { ResourceListingInfo } from "../../components/list-resources/types";

/**
 * A callback function used by the <ListResources> component (which
 * see) to get the resources to display on the `/pathogens` page.
 *
 * @returns A Promise that resolves to a ResourceListingInfo
 */
export async function pathogenResourceListingCallback(): Promise<ResourceListingInfo> {
  const sourceId = "core";
  const sourceUrl = `list-resources/${sourceId}`;

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
