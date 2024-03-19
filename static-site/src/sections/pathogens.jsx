import React from "react";
import { Link } from 'gatsby';
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import ListResources from "../components/ListResources/index";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import {coreQuickLinks, coreGroupDisplayNames} from "../../content/resource-listing.yaml";

const title = "Nextstrain-maintained pathogen analyses";
const abstract = (
  <>
    These data represent analyses and situation-reports produced by the <Link to="/team">core Nextstrain team</Link>.
    Explore analyses produced by others on the <Link to="/groups">Groups</Link> and <Link to="/community">Community</Link> pages.
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
          quickLinks={coreQuickLinks} defaultGroupLinks groupDisplayNames={coreGroupDisplayNames}/>
        <HugeSpacer/>
      </GenericPage>
    );
  }
}

export default Index;
