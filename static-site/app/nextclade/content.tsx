import React from "react";

import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import NextcladeResourceListing from "./resources";
import { SmallSpacer, HugeSpacer } from "../../components/spacers";
import { title } from "./constants";

/**
 * A React Server component that generates the contents of the
 * /nextclade page.
 */
export default function NextcladePageContent(): React.ReactElement {
  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h1>{title}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          Reference trees for{" "}
          <a
            href="https://docs.nextstrain.org/projects/nextclade/page/user/datasets.html"
            target="_blank"
            rel="noreferrer"
          >Nextclade datasets</a> produced by the{" "}
          <a href="/team">core Nextstrain team</a> and broader Nextclade community.
          In addition to these trees, Nextclade datasets contain other files
          such as reference sequences and genome annotations.
        </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />
      <NextcladeResourceListing/>
      <HugeSpacer />
    </>
  );
}
