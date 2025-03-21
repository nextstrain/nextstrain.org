import React from "react";
import type { Metadata } from "next";

import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import ListResources from "../../../components/list-resources";
import { SmallSpacer, HugeSpacer } from "../../../components/spacers";

import { stagingResourceListingCallback } from "./callback";

/**
 * A React Server component that generates the contents of the
 * /staging page.
 *
 * This is abstracted out into a distinct component so that it can
 * also be used in the "./not-found.tsx" component, to render the
 * /staging page content beneath an error banner, when a bad URL is
 * requested.
 */
export default function StagingPageContent({
  metadata,
}: {
  /**
   * A Metadata object, that is assumed to have a `title` key with a
   * string value
   */
  metadata: Metadata;
}): React.ReactElement {
  // the cast is not ideal, but it _is_ going to be a string...
  const title = metadata.title as string; // eslint-disable-line @typescript-eslint/consistent-type-assertions

  return (
    <>
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
        resourceListingCallback={stagingResourceListingCallback}
        resourceType="dataset"
        tileData={[]}
        versioned={false}
      />

      <HugeSpacer />
    </>
  );
}
