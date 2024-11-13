import React from "react";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import ListResources from "../components/ListResources/index";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import {coreQuickLinks, coreGroupDisplayNames, coreTiles} from "../../content/resource-listing.yaml";

const title = "Nextstrain-maintained pathogen analyses";
const abstract = (
  <>
    These data represent analyses and situation-reports produced by the <a href="/team">core Nextstrain team</a>.
    Explore analyses produced by others on the <a href="/groups">Groups</a> and <a href="/community">Community</a> pages.
    <br/><br/>
    We aim to provide a continually-updated view of publicly available data to show pathogen evolution and epidemic spread.
    The pipeline used to generate each dataset is available on <a href="https://github.com/nextstrain/">our GitHub page</a> or by loading a dataset and
    clicking the &ldquo;built with&rdquo; link at the top of the page.
  </>
);

const resourceListingCallback = async () => {
  const sourceId = "core"
  const sourceUrl = `list-resources/${sourceId}`;

  const response = await fetch(sourceUrl, {headers: {accept: "application/json"}});
  if (response.status !== 200) {
    throw new Error(`fetching data from "${sourceUrl}" returned status code ${response.status}`);
  }

  return (await response.json()).dataset[sourceId];
};

class Index extends React.Component {
  render() {
    return (
      <GenericPage>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>

        <HugeSpacer/>

        <ListResources resourceType="dataset"
          tileData={coreTiles}
          quickLinks={coreQuickLinks} defaultGroupLinks
          groupDisplayNames={coreGroupDisplayNames}
          resourceListingCallback={resourceListingCallback}/>

        <HugeSpacer/>
      </GenericPage>
    );
  }
}

export default Index;
