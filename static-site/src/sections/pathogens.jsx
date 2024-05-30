import React from "react";
import { InternalLink } from "../components/Misc/internal-link";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import ListResources from "../components/ListResources/index";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import {coreQuickLinks, coreGroupDisplayNames, coreShowcase} from "../../content/resource-listing.yaml";

const title = "Nextstrain-maintained pathogen analyses";
const abstract = (
  <>
    These data represent analyses and situation-reports produced by the <InternalLink href="/team">core Nextstrain team</InternalLink>.
    Explore analyses produced by others on the <InternalLink href="/groups">Groups</InternalLink> and <InternalLink href="/community">Community</InternalLink> pages.
    <br/><br/>
    We aim to provide a continually-updated view of publicly available data to show pathogen evolution and epidemic spread.
    The pipeline used to generate each dataset is available on <a href="https://github.com/nextstrain/">our GitHub page</a> or by loading a dataset and
    clicking the &ldquo;built with&rdquo; link at the top of the page.
  </>
);

class Index extends React.Component {
  render() {
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>

        <HugeSpacer/>
        <ListResources sourceId="core" resourceType="dataset"
          showcase={coreShowcase}
          quickLinks={coreQuickLinks} defaultGroupLinks groupDisplayNames={coreGroupDisplayNames}/>
        <HugeSpacer/>
      </GenericPage>
    );
  }
}

export default Index;
