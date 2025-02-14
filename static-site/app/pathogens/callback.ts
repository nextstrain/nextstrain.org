import { ResourceListingInfo } from "../../components/list-resources/types";

export async function resourceListingCallback(): Promise<ResourceListingInfo> {
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
