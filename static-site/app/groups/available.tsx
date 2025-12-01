"use client";

import React, { useCallback, useContext } from "react";

import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import ListResources from "../../components/list-resources";
import { Group, Resource} from "../../components/list-resources/types";
import { BigSpacer, HugeSpacer } from "../../components/spacers";
import { UserContext } from "../../components/user-data-wrapper";
import fetchAndParseJSON from "../../util/fetch-and-parse-json";
import ScrollableAnchor from "../../vendored/react-scrollable-anchor/index";

import GroupTiles from "./group-tiles";

import type { AvailableGroups, DataResource } from "./types";

/**
 * A React Client Component that fetches and then lists all the groups
 * available to a user, using both a <GroupTiles> component for a
 * tile-based view of the groups, and <ListResources> components for
 * card-based views of available datasets and narratives within the groups.
 */
export default function Available(): React.ReactElement {
  const { user } = useContext(UserContext);

  // NOTE: "group" has two meanings here - a nextstrain group and a group of
  // resources for listing. Luckily for us the "group name" is the same for both
  const resourcesCallback = useCallback(async (): Promise<Group[]> => {
    // Any errors should be caught by ListResources
    const available = await fetchAndParseJSON<AvailableGroups>(
      "/charon/getAvailable?prefix=/groups",
    );

    /* Convert the API response structure into `Group[]` */
    function convertToResource(dataResource: DataResource, resourceType: "dataset" | "narrative"): Resource {
      const parts = dataResource.request.split('/').slice(1);
      if (parts[0] !== "groups") {
        // This should never happen
        throw new Error(`Unexpected: Request does not start with "groups": ${dataResource.request}`)
      }
      const groupName = parts[1]
      if (groupName === undefined) {
        // This should never happen
        throw new Error(`Unexpected: Unable to parse group name from request: ${dataResource.request}`)
      }
      const name = parts.slice(1).join('/');
      const nameParts = name.split('/');
      return {
        name,
        groupName,
        nameParts,
        displayNameParts: nameParts.slice(1),
        sortingName: name,
        url: dataResource.request,
        resourceType,
      };
    }

    const resources = [
      ...available.datasets.map(d => convertToResource(d, "dataset")),
      ...available.narratives.map(n => convertToResource(n, "narrative")),
    ];

    const groups = Array.from(new Set(resources.map((r) => r.groupName)))
      .map((groupName): Group => {
        const filteredResources = resources.filter((r) => r.groupName===groupName);
        return {
          groupName,
          groupDisplayName: groupName,
          groupUrl: `/groups/${groupName}`,
          groupUrlTooltip: `Click to view the page for ${groupName}`,
          resources: filteredResources,
          nResources: filteredResources.length,
          nVersions: undefined,
          lastUpdated: undefined,
        }
      });
    return groups;
  }, []);

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h2 className="centered">Available groups</h2>
      <FlexCenter>
        <FocusParagraphCentered>
          Click on any tile to view the different datasets and narratives
          available for that group.{" "}
          {user ? (
            <>
              A padlock icon indicates a private group which you (
              {user.username}) have access to.
            </>
          ) : (
            <>
              These groups are all public, to see private groups please{" "}
              <a href="/login">log in</a>.
            </>
          )}
        </FocusParagraphCentered>
      </FlexCenter>

      {/* These tiles don't go nicely into FlexCenter as they manage their own spacing */}
      <GroupTiles />

      <HugeSpacer />

      <ScrollableAnchor id={'resources'}>
        <h2 className="centered">Available Resources</h2>
      </ScrollableAnchor>

      <BigSpacer />

      <ListResources
        resourceType="resource"
        versioned={false}
        fetchResourceGroups={resourcesCallback}
      />
    </>
  );
}
