import data from "./resource-listing.yaml";
import { FilterTile, QuickLink, SplashPage } from "../components/list-resources/types";

export interface CoreResources {
  coreQuickLinks: QuickLink[];
  coreTiles: FilterTile[];
  coreGroupDisplayNames: Record<string, string>;
  coreSplashPages: SplashPage[];
}

export const coreResources = data as CoreResources;
