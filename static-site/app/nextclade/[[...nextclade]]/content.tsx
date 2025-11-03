import React from "react";

import { TitledMetadata } from "../../types";
import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import NextcladeResourceListing from "./resources";
import { SmallSpacer, HugeSpacer } from "../../../components/spacers";

/**
 * A React Server component that generates the contents of the
 * /nextclade page.
 *
 * This is abstracted out into a distinct component so that it can
 * also be used in the "./not-found.tsx" component, to render the
 * /nextclade page content beneath an error banner, when a bad URL is
 * requested.
 */
export default function NextcladePageContent({
  metadata,
}: {
  /**
   * A Metadata object, that is assumed to have a `title` key with a
   * string value
   */
  metadata: TitledMetadata;
}): React.ReactElement {
  const title = metadata.title;

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h1>{title}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          Part of{" "}
          <a
            href="https://docs.nextstrain.org/projects/nextclade/page/user/datasets.html"
            target="_blank"
            rel="noreferrer"
          >Nextclade datasets</a> produced by the{" "}
          <a href="/team">core Nextstrain team</a> and broader Nextclade community.
        </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />
      <NextcladeResourceListing/>
      <HugeSpacer />
    </>
  );
}
