"use client";

import React from "react";

import DatasetSelect from "../../../components/dataset-select";
import {
  DatasetSelectColumnsType,
  DatasetType,
} from "../../../components/dataset-select/types";
import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import { SmallSpacer, HugeSpacer } from "../../../components/spacers";
import communityDatasetsYaml from "../../../content/community-datasets.yaml";
import { title } from "./constants";

/** Column definitions for <DatasetSelect> */
const tableColumns: DatasetSelectColumnsType[] = [
  {
    name: "Name",
    value: (entry) => entry.urlDisplayName?.replace(/\//g, " / ") || "",
    url: (entry) => entry.url.replace(/.*nextstrain.org/, ""),
  },
  {
    name: "Maintainer",
    value: (entry) => entry.contributor || "Unknown",
  },
];

/**
 * A React Client Component that generates the contents of the
 * main /community page.
 */
export default function CommunityPageContent(): React.ReactElement {
  const datasetSelectData = _parseTableData(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    communityDatasetsYaml as { data: DatasetType[] },
  );

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h1>{title}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          We allow researchers to share their analyses through nextstrain.org by
          storing the results of their analysis in their own{" "}
          <a href="https://github.com/">GitHub repositories</a>. This gives you
          complete control, ownership, and discretion over your data; there is
          no need to get in touch with the Nextstrain team to share your data
          this way. For more details, including instructions on what file
          formats and naming conventions to use,{" "}
          <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html">
            please see our documentation
          </a>
          .
          <br />
          <br />
          The table below contains Datasets and Narratives which have been made
          publicly available. To add yours to the table below please make a Pull
          Request to add it{" "}
          <a href="https://github.com/nextstrain/nextstrain.org/blob/master/static-site/content/community-datasets.yaml">
            to this file.
          </a>{" "}
          For further details about the analyses below, please contact the
          authors.
          <br />
          <br />
          P.S. For an alternative approach to sharing data through
          nextstrain.org which is allows larger datasets and/or private data
          sharing, see{" "}
          <a href="/groups">Scalable Sharing with Nextstrain Groups</a>.
        </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />
      <HugeSpacer />

      <DatasetSelect
        title="Search Community Datasets and Narratives "
        datasets={datasetSelectData}
        columns={tableColumns}
        rowSort={[]}
      />
    </>
  );
}

// Helper function to turn the YAML file contents into a list of "proper" DatasetType objects
function _parseTableData(yamlData: { data: DatasetType[] }): DatasetType[] {
  const communityUrlPattern = new RegExp(
    "^/community(/narratives)?/(?<org>[^/]+)/(?<repo>[^/]+)(?<pathSuffix>/.*)?",
  );

  return yamlData.data.flatMap((entry: DatasetType): DatasetType | [] => {
    const url = new URL(entry.url, "https://nextstrain.org");

    const urlMatches = url.pathname.match(communityUrlPattern);

    // yes this is kinda silly but think of it as a type guard.
    if (urlMatches) {
      return {
        ...entry,
        url: url.pathname,
        /* urlDisplayName is the URL name, less the /community or /community/narratives parts */
        urlDisplayName: `${urlMatches.groups?.org}/${urlMatches.groups?.repo}${urlMatches.groups?.pathSuffix || ""}`,
      };
    } else {
      console.warn(
        `Removing data entry "${entry.name}" as URL <${entry.url}> is not valid`,
      );
      // .flatMap() will strip these empty arrays out of the returned value
      return [];
    }
  });
}
