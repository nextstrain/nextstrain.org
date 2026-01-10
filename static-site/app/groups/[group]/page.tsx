"use client";

import React, { useEffect, useState } from "react";

import ScrollableAnchor from "../../../vendored/react-scrollable-anchor/index";

import Button from "../../../components/button";
import ErrorMessage from "../../../components/error-message";
import { FlexGridRight } from "../../../components/flex-grid";
import ListResources from "../../../components/list-resources";
import { Group, Resource } from "../../../components/list-resources/types";
import SourceInfoHeading, {
  SourceInfo,
} from "../../../components/source-info-heading";
import { HugeSpacer } from "../../../components/spacers";
import Spinner from "../../../components/spinner";
import fetchAndParseJSON from "../../../util/fetch-and-parse-json";

import { canUserEditGroupSettings, canViewGroupMembers } from "./utils";

import type { AvailableGroups, DataResource } from "../types";

/**
 * A React Client component to display a page for an individual
 * Nextstrain group
 */
export default function IndividualGroupPage({
  params,
  nonExistentPath,
}: {
  params: {
    /** the name of the group to display */
    group: string;
  }
  /** used to store the request url when asking for a nonexistent resource */
  nonExistentPath?: string
}): React.ReactElement {
  /** a flag for whether data is being loaded */
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  /**
   * boolean for whether the currently logged-in user can edit the
   * settings of the current group
   */
  const [editGroupSettingsAllowed, setEditGroupSettingsAllowed] =
    useState<boolean>(false);
  /**
   * flag used when the group doesn't exist (or is private and
   * not accessible to the currently logged-in user)
   */
  const [groupNotFound, setGroupNotFound] = useState<boolean>(false);
  /** the resources of the group being displayed */
  const [dataResources, setDataResources] = useState<DataResource[]>([]);
  /** props passed to a <SourceInfoHeader> child component */
  const [sourceInfo, setSourceInfo] = useState<SourceInfo>({
    title: "",
    byline: "",
    website: null,
    showDatasets: false,
    showNarratives: false,
    avatar: "",
  });
  /**
   * boolean for whether the currently logged-in user can view the
   * members of the current group
   */
  const [viewGroupMembersAllowed, setViewGroupMembersAllowed] =
    useState<boolean>(false);

  const { group } = params;

  useEffect(() => {
    document.title = `"${group}" Group - Nextstrain`;

    async function getGroupInfo(): Promise<void> {
      try {
        const [sourceInfo, availableData] = await Promise.all([
          fetchAndParseJSON<SourceInfo>(`/charon/getSourceInfo?prefix=/groups/${group}/`),
          fetchAndParseJSON<AvailableGroups>(`/charon/getAvailable?prefix=/groups/${group}/`),
        ]);

        setSourceInfo(sourceInfo);
        setDataResources([
          ...availableData.datasets,
          ...availableData.narratives,
        ]);
        setEditGroupSettingsAllowed(await canUserEditGroupSettings(group));
        setViewGroupMembersAllowed(await canViewGroupMembers(group));

        setDataLoading(false);
      } catch (err) {
        console.error(
          `Cannot find group ${group}.`,
          err instanceof Error ? err.message : String(err),
        );
        setGroupNotFound(true);
      }
    }

    getGroupInfo();
  }, [group]);

  // NOTE: "group" has two meanings here - a nextstrain group and a group of
  // resources for listing. Luckily for us the "group name" is the same for both
  async function resourcesCallback(): Promise<Group[]> {
    const resources = dataResources.map((dataResource): Resource => {
      const parts = dataResource.request.split('/');
      const name = parts.slice(2).join('/');
      return {
        name,
        groupName: group,
        nameParts: name.split('/'),
        sortingName: name,
        url: `/${dataResource.request}`,
        resourceType: parts[2] === "narratives" ? "narrative" : "dataset",
        lastUpdated: dataResource.lastUpdated,
      };
    });
    const datasets = resources.filter(r => r.resourceType === "dataset");
    const narratives = resources.filter(r => r.resourceType === "narrative");

    let datasetGroups: Group[] = [];
    let narrativeGroups: Group[] = [];

    // Add datasets with optional grouping by first name part
    if (datasets.length > 0) {
      // Group by first name part if any dataset has more than one name part
      const nestedDatasets = datasets.some(r => r.nameParts.length > 1);
      if (nestedDatasets) {
        const updatedDatasets = datasets.map((r): Resource => {
          const firstNamePart = r.nameParts[0];
          if (firstNamePart === undefined) {
            // This should never happen
            throw new Error(`Unexpected: Dataset "${r.name}" has no name parts`);
          }
          return {
            ...r,
            groupName: firstNamePart,
          };
        });
        const firstNameParts = Array.from(new Set(updatedDatasets.map(r => r.groupName)));
        datasetGroups = firstNameParts.map((firstNamePart): Group => {
          const datasetsInGroup = updatedDatasets.filter(r => r.groupName === firstNamePart);
          // Calculate the most recent lastUpdated from all resources in this group
          const groupLastUpdated = datasetsInGroup.reduce((latest, r) => {
            if (!r.lastUpdated) return latest;
            if (!latest) return r.lastUpdated;
            return new Date(r.lastUpdated) > new Date(latest) ? r.lastUpdated : latest;
          }, undefined as string | undefined);
          return {
            groupName: firstNamePart,
            resources: datasetsInGroup,
            nResources: datasetsInGroup.length,
            nVersions: undefined,
            lastUpdated: groupLastUpdated,
          };
        });
      } else {
        // Use a single group for all datasets
        const groupLastUpdated = datasets.reduce((latest, r) => {
          if (!r.lastUpdated) return latest;
          if (!latest) return r.lastUpdated;
          return new Date(r.lastUpdated) > new Date(latest) ? r.lastUpdated : latest;
        }, undefined as string | undefined);
        datasetGroups = [{
          groupName: "datasets",
          resources: datasets,
          nResources: datasets.length,
          nVersions: undefined,
          lastUpdated: groupLastUpdated,
        }];
      }
    }

    // Add narratives
    if (narratives.length > 0) {
      const groupLastUpdated = narratives.reduce((latest, r) => {
        if (!r.lastUpdated) return latest;
        if (!latest) return r.lastUpdated;
        return new Date(r.lastUpdated) > new Date(latest) ? r.lastUpdated : latest;
      }, undefined as string | undefined);
      narrativeGroups = [{
        groupName: "narratives",
        resources: narratives,
        nResources: narratives.length,
        nVersions: undefined,
        lastUpdated: groupLastUpdated,
      }];
    }

    return [
      ...datasetGroups,
      ...narrativeGroups,
    ]
  }

  let bannerContents: React.ReactElement = <></>;
  let bannerTitle = "";
  let resourceType = "dataset";

  if (nonExistentPath) {
    if (nonExistentPath.startsWith("narratives/")) {
      resourceType = "narrative";
    } else if (nonExistentPath.startsWith("settings/")) {
      resourceType = "setting";
    }

    bannerContents = (
      <p>Here is the page for the &ldquo;{group}&rdquo; Nextstrain Group.</p>
    );
    bannerTitle = `The ${resourceType} "nextstrain.org/groups/${group}/${nonExistentPath}" doesn't exist.`;
  }

  if (groupNotFound) {
    const notFound = `The Nextstrain Group "${group}" doesn't exist yet, or there was an error getting data for that group.`;
    const linkToGroupsPage = (
      <p>
        For available Nextstrain Groups, check out the{" "}
        <a href="/groups">Groups page</a>.
      </p>
    );

    if (!bannerTitle) {
      bannerTitle = notFound;
      bannerContents = linkToGroupsPage;
    } else {
      bannerContents = (
        <>
          {notFound}
          <br />
          {linkToGroupsPage}
        </>
      );
    }
  }

  if (groupNotFound) {
    return <ErrorMessage title={bannerTitle} contents={bannerContents} />;
  } else {
    return (
      <>
        <HugeSpacer />
        <HugeSpacer />

        <FlexGridRight>
          {viewGroupMembersAllowed && (
            <div style={{ margin: "10px" }}>
              <Button to={`/groups/${group}/settings/members`}>
                Group Members
              </Button>
            </div>
          )}
          {editGroupSettingsAllowed && (
            <div style={{ margin: "10px" }}>
              <Button to={`/groups/${group}/settings`}>
                Edit Group Settings
              </Button>
            </div>
          )}
        </FlexGridRight>

        {bannerTitle && (
          <ErrorMessage title={bannerTitle} contents={bannerContents} />
        )}

        {dataLoading && <Spinner />}

        <SourceInfoHeading sourceInfo={sourceInfo} />

        <HugeSpacer />

        {(sourceInfo.showDatasets || sourceInfo.showNarratives) && (
          <ScrollableAnchor id={"resources"}>
            <div>
              <h3 className="centered">Available resources</h3>
              <ListResources
                resourceType="resource"
                versioned={false}
                fetchResourceGroups={resourcesCallback}
              />
            </div>
          </ScrollableAnchor>
        )}
      </>
    );
  }
}
