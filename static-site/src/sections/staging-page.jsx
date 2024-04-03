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

  async componentDidMount() {
    this.setState({
      nonExistentPath: this.props["*"]
    });
  }

  banner() {
    if (this.state.nonExistentPath && (this.state.nonExistentPath.length > 0)) {
      const bannerTitle = this.state.nonExistentPath.startsWith("narratives/")
        ? `The staging narrative "nextstrain.org${this.props.location.pathname}" doesn't exist.`
        : `The staging dataset "nextstrain.org${this.props.location.pathname}" doesn't exist.`;
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

export default Index;
