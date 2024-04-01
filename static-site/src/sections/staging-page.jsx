import React from "react";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import { ErrorBanner } from "../components/splash/errorMessages";
import ListResources from "../components/ListResources/index";
import { withRouter } from 'next/router'

const title = "Staging Data";
const abstract = (
  <>
    Staging datasets & narratives are intended primarily for internal (Nextstrain team) usage.
    They should be considered unreleased and/or out of date; they should not be used to draw scientific conclusions.
  </>
);

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  checkRouterParams() {
    /* Check the next.js router for query params which indicate that the URL was
    attempting to load a resource but it doesn't exist, e.g. "/staging/no/dataset/here".
    We update state which results in an error banner being shown. */
    if (!this.state.resourcePath && this.props.router.query?.staging) {
      this.setState({resourcePath: "staging/"+this.props.router.query.staging.join("/")})
    }    
  }

  componentDidMount() {this.checkRouterParams()}
  componentDidUpdate() {this.checkRouterParams()}


  banner() {
    if (this.state.resourcePath) {
      const bannerTitle = this.state.resourcePath.startsWith("narratives/")
        ? `The staging narrative "nextstrain.org/${this.state.resourcePath}" doesn't exist.`
        : `The staging dataset "nextstrain.org/${this.state.resourcePath}" doesn't exist.`;
      const bannerContents = `Here is the staging page instead.`;
      return <ErrorBanner title={bannerTitle} contents={bannerContents}/>;
    }
    return null;
  }

  render() {
    const banner = this.banner();
    return (
      <GenericPage location={this.props.location} banner={banner}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>
        <HugeSpacer />

        <ListResources sourceId="staging" resourceType="dataset" versioned={false}/>

        <HugeSpacer />

      </GenericPage>
    );
  }
}

export default withRouter(Index);
