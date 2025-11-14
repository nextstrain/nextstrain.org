import React from "react";
import type { Metadata } from "next";

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
