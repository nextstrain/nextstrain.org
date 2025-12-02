import React from "react";

import type { TitledMetadata } from "../types";
import ErrorMessage from "../../components/error-message";
import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import NextcladeResourceListing from "./resources";
import { SmallSpacer, HugeSpacer } from "../../components/spacers";

/**
 * A React Server component that generates the contents of the
 * /nextclade page.
 *
 * When nonExistentPath is provided, displays an error banner for
 * the requested (but non-existent) resource, then shows the regular
 * nextclade page content.
 */
export default function NextcladePageContent({
  metadata,
  nonExistentPath,
}: {
  /**
   * A Metadata object, that is assumed to have a `title` key with a
   * string value
   */
  metadata: TitledMetadata;
  /**
   * Used to store the request URL when asking for a nonexistent resource
   */
  nonExistentPath?: string;
}): React.ReactElement {
  const title = metadata.title;

  let bannerContents: React.ReactElement = <></>;
  let bannerTitle = "";
  let resourceType = "dataset";

  if (nonExistentPath) {
    if (nonExistentPath.startsWith("narratives/")) {
      resourceType = "narrative";
    }

    bannerContents = (
      <p>Here is the Nextclade reference trees page instead.</p>
    );
    bannerTitle = `The Nextclade ${resourceType} "nextstrain.org/nextclade/${nonExistentPath}" doesn't exist.`;
  }

  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      {bannerTitle && bannerContents && (
        <ErrorMessage title={bannerTitle} contents={bannerContents} />
      )}

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
