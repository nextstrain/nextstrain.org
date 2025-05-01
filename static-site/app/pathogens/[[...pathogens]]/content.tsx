import React from "react";
import { Metadata } from "next";

import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import ListResources from "../../../components/list-resources";
import { SmallSpacer, HugeSpacer } from "../../../components/spacers";
import * as coreResources from "../../../content/resource-listing.yaml";

import { pathogenResourceListingCallback } from "./callback";

/**
 * React Server Component that generates the content of the /pathogens page
 *
 * This is abstracted out into a distinct component so that it can
 * also be used in the "./not-found.tsx" component, to render the
 * /staging page content beneath an error banner, when a bad URL is
 * requested.
 */
export default function PathogensPageContent({
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
          These data represent analyses produced by the{" "}
          <a href="/team">core Nextstrain team</a>. Explore analyses produced by
          others on the <a href="/groups">Groups</a> and{" "}
          <a href="/community">Community</a> pages.
          <br />
          <br />
          We aim to provide a continually-updated view of publicly available
          data to show pathogen evolution and epidemic spread. The pipeline used
          to generate each dataset is available on{" "}
          <a href="https://github.com/nextstrain/">our GitHub page</a> or by
          loading a dataset and clicking the &ldquo;built with&rdquo; link at
          the top of the page.
        </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />

      <ListResources
        defaultGroupLinks
        groupDisplayNames={coreResources["coreGroupDisplayNames"]}
        quickLinks={coreResources["coreQuickLinks"]}
        resourceListingCallback={pathogenResourceListingCallback}
        resourceType="dataset"
        tileData={coreResources["coreTiles"]}
        versioned
      />

      <HugeSpacer />
    </>
  );
}
