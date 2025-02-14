import React from "react";

import FlexCenter from "../../components/flex-center";
import { FocusParagraphCentered } from "../../components/focus-paragraph";
import ListResources from "../../components/list-resources";
import { SmallSpacer, HugeSpacer } from "../../components/spacers";
import * as coreResources from "../../content/resource-listing.yaml";

/**
 * React Server Component that generates and presents a list of
 * pathogen resources.
 */
export default function Pathogens(): React.ReactElement {
  return (
    <>
      <HugeSpacer />
      <HugeSpacer />

      <h1>Nextstrain-maintained pathogen analyses</h1>

      <SmallSpacer />

      <FlexCenter>
        <FocusParagraphCentered>
          These data represent analyses and situation-reports produced by the{" "}
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
        resourceType="dataset"
        tileData={coreResources["coreTiles"]}
        versioned
      />

      <HugeSpacer />
    </>
  );
}
