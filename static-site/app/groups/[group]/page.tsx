"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ScrollableAnchor from "../../../vendored/react-scrollable-anchor/index";

import Button from "../../../components/button";
import DatasetSelect from "../../../components/dataset-select";
import { DatasetType } from "../../../components/dataset-select/types";
import ErrorMessage from "../../../components/error-message";
import { FlexGridRight } from "../../../components/flex-grid";
import SourceInfoHeading, {
  SourceInfo,
} from "../../../components/source-info-heading";
import { HugeSpacer } from "../../../components/spacers";
import Spinner from "../../../components/spinner";
import fetchAndParseJSON from "../../../util/fetch-and-parse-json";

import { canUserEditGroupSettings, canViewGroupMembers } from "../utils";

import type { AvailableGroups, DataResource } from "../types";

/**
 * A React Client component to display a page for an individual
 * Nextstrain group
 */
export default function IndividualGroupPage({ nonExistentPathParam }: { nonExistentPathParam?: string }): React.ReactElement {
  /** a flag for whether data is being loaded */
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  /** the datasets of the group being displayed */
  const [datasets, setDatasets] = useState<DatasetType[]>([]);
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
  /** the narratives of the group being displayed */
  const [narratives, setNarratives] = useState<DatasetType[]>([]);
  /** used to store the request url when asking for a group that can't be read */
  const [nonExistentPath, setNonExistentPath] = useState<string>(nonExistentPathParam || "");
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

  const { group } = useParams();

  useEffect(() => {
    async function getGroupInfo(): Promise<void> {
      try {
        const [sourceInfo, availableData] = await Promise.all([
          fetchAndParseJSON<SourceInfo>(`/charon/getSourceInfo?prefix=/groups/${group}/`),
          fetchAndParseJSON<AvailableGroups>(`/charon/getAvailable?prefix=/groups/${group}/`),
        ]);

        setSourceInfo(sourceInfo);
        setDatasets(
          _createDatasetListing(
            availableData.datasets,
            group,
          ),
        );
        setNarratives(
          _createDatasetListing(
            availableData.narratives,
            group,
          ),
        );
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

        {sourceInfo.showDatasets && (
          <ScrollableAnchor id={"datasets"}>
            <div>
              <h3 className="centered">Available datasets</h3>
              {datasets.length === 0 ? (
                <h4 className="centered">
                  No datasets are available for this group.
                </h4>
              ) : (
                <DatasetSelect
                  datasets={datasets}
                  columns={[
                    {
                      name: "Dataset",
                      value: (dataset) =>
                        dataset.filename
                          ?.replace(/_/g, " / ")
                          .replace(".json", "") || "",
                      url: (dataset) => dataset.url,
                    },
                  ]}
                />
              )}
            </div>
          </ScrollableAnchor>
        )}

        <HugeSpacer />

        {sourceInfo.showNarratives && (
          <ScrollableAnchor id={"narratives"}>
            <div>
              <h3 className="centered">Available narratives</h3>
              {narratives.length === 0 ? (
                <h4 className="centered">
                  No narratives are available for this group.
                </h4>
              ) : (
                <DatasetSelect
                  datasets={narratives}
                  columns={[
                    {
                      name: "Narrative",
                      value: (dataset) =>
                        dataset.filename
                          ?.replace(/_/g, " / ")
                          .replace(".json", "") || "",
                      url: (dataset) => dataset.url,
                    },
                  ]}
                  title="Filter Narratives"
                />
              )}
            </div>
          </ScrollableAnchor>
        )}
      </>
    );
  }
}

// helper function to parse getAvailable listing into one that the
// <DatasetSelect> component will accept
function _createDatasetListing(
  list: DataResource[],
  group: string,
): DatasetType[] {
  return list.map((d: DataResource): DatasetType => {
    return {
      filename: d.request
        .replace(`groups/${group}/`, "")
        .replace("narratives/", ""),
      url: `/${d.request}`,
      contributor: group,
    };
  });
}
