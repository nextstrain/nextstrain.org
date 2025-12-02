import React from "react";

import type { TitledMetadata } from "../../types";
import CorePathogenResourceListing from "./resources";
import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import { SmallSpacer, HugeSpacer } from "../../../components/spacers";

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
          These analyses are{" "}
          <a
            href="https://docs.nextstrain.org/en/latest/reference/glossary.html#term-phylogenetic-dataset"
            target="_blank"
            rel="noreferrer"
          >
            phylogenetic datasets
          </a> produced by the{" "}
          <a href="/team">core Nextstrain team</a>. Explore analyses produced by
          others on the <a href="/groups">Groups</a> and{" "}
          <a href="/community">Community</a> pages.
          <br />
          <br />
          We aim to provide continually-updated views of publicly available
          data to show pathogen evolution and epidemic spread. The pipeline used
          to generate each dataset is available on{" "}
          <a
            href="https://github.com/nextstrain/"
            target="_blank"
            rel="noreferrer"
          >
            our GitHub page
          </a> or by loading a dataset and clicking the &ldquo;built
          with&rdquo; link at the top of the page.
          <br />
          <br />
          Workflow files such as sequences and metadata are listed on the
          {' '}<a href="/pathogens/files">pathogens/files page</a> where available.
        </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />
      <CorePathogenResourceListing/>
      <HugeSpacer />
    </>
  );
}
