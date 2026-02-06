import React from "react";
import { Metadata } from "next";

import FlexCenter from "../../../components/flex-center";
import { FocusParagraphCentered } from "../../../components/focus-paragraph";
import CorePathogenResourceListing from "./resources";
import { SmallSpacer, HugeSpacer } from "../../../components/spacers";


const title = "Workflow data files for core pathogens";

export const metadata: Metadata = {
  title,
};

export default function PathogenWorkflowFiles(): React.ReactElement {
  return (
    <div>
      <HugeSpacer />
      <HugeSpacer />

      <h1>{title}</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          {`As part of our Nextstrain-maintained analyses we generate `}
          <a href="https://docs.nextstrain.org/en/latest/reference/data-files.html" target="_blank" rel="noreferrer">
            workflow files such as sequence FASTAs and metadata TSVs
          </a>
          {`. This page lists the latest versions of these files as well as providing a window into the history`}
          {` of the file uploads across time.`}
          {` The available Auspice visualisations related to these workflow files are shown at the `}
          <a href="/pathogens">/pathogens</a>
          {` page.`}
          <br/>
          <br/>
          {`Each filename below is a clickable (external) link which will download the latest version of the particular file.`}
          {` Hovering on a filename shows the last known update date however our knowledge of this lags by a day or two`}
          {` and so a more recent copy may be available; if this is the case the link will point to the latest version.`}
          <br/>
          <br/>
          {`The 'show full history' link details the temporal history of files for a given pathogen.`}
          <br/>
          <br/>
          {`We gratefully acknowledge the authors, originating and submitting laboratories of the genetic sequences`}
          {` and metadata for sharing their work. This work is made possible by the open sharing of genetic data by`}
          {` research groups from all over the world. We gratefully acknowledge their contributions.`}
          <br/>
          <br/>
          {`Please note that although data generators have generously shared data in an open fashion,`}
          {` that does not mean there should be free license to publish on this data.`}
          {` Data generators should be cited where possible and collaborations should be sought in some circumstances.`}
          {` Please try to avoid scooping someone else's work. Reach out if uncertain.`}
          <br/>
          <br/>
          {`Some of these files contain Restricted Data from Pathoplexus.`}
          <br/>
          {`To use these in your own analysis, please read `}
          <a href="https://pathoplexus.org/about/terms-of-use/restricted-data" target="_blank" rel="noreferrer">
            Pathoplexus Restricted Data Terms of Use
          </a>
          {`.`}
          </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />
      <CorePathogenResourceListing/>
      <HugeSpacer />
    </div>
  );
}
