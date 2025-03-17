import React from "react";
import { Metadata } from "next";

import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import ListResources from "../../../components/list-resources";
import { SmallSpacer, HugeSpacer } from "../../../components/spacers";

import ErrorBanner from "./error-banner";

const title = "Staging Data";

export const metadata: Metadata = {
  title,
};

/**
 * A React Server Component for `/staging`
 */
export default async function StagingPage(): Promise<React.ReactElement> {
  return (
    <>
      <ErrorBanner />

      <HugeSpacer />
      <HugeSpacer />

      <h1>{title}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          Staging datasets & narratives are intended primarily for internal
          (Nextstrain team) usage. They should be considered unreleased and/or
          out of date; they should not be used to draw scientific conclusions.
        </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />

      <ListResources
        defaultGroupLinks={false}
        groupDisplayNames={{}}
        quickLinks={[]}
        resourceName="staging"
        resourceType="dataset"
        tileData={[]}
        versioned={false}
      />

      <HugeSpacer />
    </>
  );
}
