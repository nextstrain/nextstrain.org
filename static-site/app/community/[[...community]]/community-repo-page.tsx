import React, { useEffect, useState } from "react";

import DatasetSelect from "../../../components/dataset-select";
import { DatasetType } from "../../../components/dataset-select/types";
import ErrorMessage from "../../../components/error-message";
import SourceInfoHeading, {
  SourceInfo,
} from "../../../components/source-info-heading";
import { HugeSpacer } from "../../../components/spacers";
import fetchAndParseJSON from "../../../util/fetch-and-parse-json";

/** Data structure for `/charon/getAvailable` response */
interface AvailableData {
  /** list of available datasets */
  datasets: CommunityResource[];
  /** list of available narratives */
  narratives: CommunityResource[];
}

/**
 * Data structure for an individual dataset in the
 * `/charon/getAvailable` response
 */
interface CommunityResource {
  /** the path to request to load the data set */
  request: string;
}

/**
 * A React Server Component for displaying a page for a community
 * repo, with metadata about the repo and user, and listing of
 * available datasets and narratives in that repo.
 */
export default function CommunityRepoPage({
  user,
  repo,
  extra,
  isNarrative,
}: {
  /** Github user name */
  user: string;
  /** Github repo name */
  repo: string;
  /** Any extra elements in the requested URL past the user and repo */
  extra: string;
  /** Was the request for a narrative? (i.e., did `/narratives/`
   * appear in the URL?)
   */
  isNarrative: boolean;
}): React.ReactElement {
  // these flags control what's displayed: the repo content and/or an error banner
  const [showContent, setShowContent] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  // this is to store the information returned from the
  // `/charon/getSourceInfo` endpoint; we initialize the state to
  // essentially an empty data structure
  const [sourceInfo, setSourceInfo] = useState<SourceInfo>({
    title: "",
    byline: "",
    website: null,
    showDatasets: false,
    showNarratives: false,
    avatar: "",
  });

  // these will hold the datasets and narratives that are parsed out
  // of the response from the `/charon/getAvailable` endpoint
  const [datasets, setDatasets] = useState<DatasetType[]>([]);
  const [narratives, setNarratives] = useState<DatasetType[]>([]);

  // this hook uses the internal (infernal?) Charon API to get
  // information about the Github user/repo in the requested path
  useEffect((): void => {
    async function fetchRepoAndParse(): Promise<void> {
      if (!user || !repo) {
        // this shouldn't ever happen, because we should only try to
        // render this component when we know we have both a user and
        // a repo
        throw new Error("we should have a user and a repo at this point…");
      }

      try {
        const [fetchedSourceInfo, fetchedAvailableData] = await Promise.all([
          fetchAndParseJSON<SourceInfo>(
            `/charon/getSourceInfo?prefix=/community/${user}/${repo}/`,
          ),
          fetchAndParseJSON<AvailableData>(
            `/charon/getAvailable?prefix=/community/${user}/${repo}/`,
          ),
        ]);

        setShowContent(true);
        setSourceInfo(fetchedSourceInfo);
        setDatasets(
          _createDatasetListing({
            list: fetchedAvailableData.datasets,
            user,
          }),
        );
        setNarratives(
          _createDatasetListing({
            list: fetchedAvailableData.narratives,
            user,
          }),
        );
      } catch (err) {
        console.error(
          "Cannot find user/repo.",
          err instanceof Error ? err.message : null,
        );

        // if the Github content fetch failed, _only_ show an error box
        setShowError(true);
      }
    }

    fetchRepoAndParse();
  }, [user, repo]);

  let errorBannerTitle: string | React.ReactElement = "";
  let errorBannerContents: React.ReactElement = <></>;

  // if we're rendering a `/community/narratives/user/repo` or a
  // `/community/user/repo/extra/stuff` request, we want to display an
  // error banner saying that thing doesn't exist (because if it did,
  // the Express router would have handled it instead of this
  // component)
  if (isNarrative || extra) {
    const resourceType = isNarrative ? "narrative" : "dataset";
    const resourcePath = `nextstrain.org/community/${isNarrative ? "narratives/" : ""}${user}/${repo}/${extra}`;

    errorBannerTitle = `The ${resourceType} "${resourcePath}" doesn't exist.`;
    errorBannerContents = (
      <p>
        Here is the page for the &ldquo;{user}/{repo}&rdquo; repository.
      </p>
    );
  }

  // if the `showError` flag is set, that means we couldn't even find
  // `github.com/user/repo`, so show an error banner that says that
  if (showError) {
    const repoNotFound = (
      <>
        The GitHub repository{" "}
        <a href={`https://github.com/${user}/${repo}`}>
          {user}/{repo}
        </a>{" "}
        doesn&apos;t exist (or is private), or there was an error getting data
        for that repository.
      </>
    );
    const settingUpHelp = (
      <>
        <p>
          If you&apos;re setting up your own Community on GitHub repository, see{" "}
          <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html">
            our documentation
          </a>
          .
        </p>
        <p>
          For a list of featured Nextstrain Community datasets, check out the{" "}
          <a href="/community">Community page</a>.
        </p>
      </>
    );

    if (errorBannerTitle) {
      // we already set up a banner in the first "is this a request
      // that should have been handled at the Express level" check, so
      // amend it
      errorBannerContents = (
        <>
          <p>{repoNotFound}</p>
          {settingUpHelp}
        </>
      );
    } else {
      // no other errors, just show the "repo not found" ones
      errorBannerTitle = repoNotFound;
      errorBannerContents = settingUpHelp;
    }
  }

  return (
    <>
      {errorBannerTitle && (
        <ErrorMessage title={errorBannerTitle} contents={errorBannerContents} />
      )}

      <HugeSpacer />

      {showContent && (
        <>
          <HugeSpacer />
          <SourceInfoHeading sourceInfo={sourceInfo}></SourceInfoHeading>
          <HugeSpacer />
          {sourceInfo.showDatasets && (
            <AvailableDatasets datasets={datasets} kind="dataset" />
          )}
          <HugeSpacer />
          {sourceInfo.showNarratives && (
            <AvailableDatasets datasets={narratives} kind="narrative" />
          )}
        </>
      )}
    </>
  );
}

/**
 * A helper React Component to display available datasets of a
 * particular kind in a <DatasetSelect> (or to display a message that
 * there aren't any datasets of that kind to display)
 */
function AvailableDatasets({
  datasets,
  kind,
}: {
  datasets: DatasetType[];
  kind: string;
}): React.ReactElement {
  const titleKind = kind[0]?.toUpperCase() + kind.slice(1);

  return (
    <div>
      <h3 className="centered">Available {kind}s</h3>
      {datasets.length === 0 ? (
        <h4 className="centered">No {kind}s are available for this repo.</h4>
      ) : (
        <DatasetSelect
          datasets={datasets}
          columns={[
            {
              name: titleKind,
              value: (dataset) =>
                dataset.filename?.replace(/_/g, " / ").replace(".json", "") ||
                "",
              url: (dataset) => dataset.url,
            },
          ]}
          title={`Filter ${titleKind}s`}
        />
      )}
    </div>
  );
}

// helper to map the `/charon/getAvailable` response into a list of
// DatasetType objects
function _createDatasetListing({
  list,
  user,
}: {
  list: CommunityResource[];
  user: string;
}): DatasetType[] {
  if (!list) return [];

  // Note that the `request` always includes @branch, irregardless of URL.
  return list.map((d: CommunityResource): DatasetType => {
    return {
      // filename will be used by <DatasetSelect> as the display name
      filename: d.request.replace(
        /\/?(community\/)?(narratives\/)?[^/]+\/[^/]+\/?/,
        "",
      ),
      url: `/${d.request}`,
      contributor: user,
    };
  });
}
