import React from "react";

import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import StagingPathogenResourceListing from "./resources";
import { SmallSpacer, HugeSpacer } from "../../components/spacers";
import { title } from "./constants";

/**
 * A React Server component that generates the contents of the
 * /staging page.
 */
export default function StagingPageContent(): React.ReactElement {
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
      <StagingPathogenResourceListing/>
      <HugeSpacer />
    </>
  );
}
