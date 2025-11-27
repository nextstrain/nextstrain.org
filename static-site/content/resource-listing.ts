import data from "./resource-listing.yaml";
import { FilterTile, QuickLink } from "../components/list-resources/types";

export interface CoreResources {
  coreQuickLinks: QuickLink[];
  coreTiles: FilterTile[];
  coreGroupDisplayNames: Record<string, string>;
}

export const coreResources = data as CoreResources;
