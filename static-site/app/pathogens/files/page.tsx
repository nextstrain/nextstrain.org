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
          </FocusParagraphCentered>
      </FlexCenter>

      <HugeSpacer />
      <CorePathogenResourceListing/>
      <HugeSpacer />
    </div>
  );
}
