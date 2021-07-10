import React from "react";
import { Link } from "gatsby";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import { ErrorBanner } from "../components/splash/errorMessages";

const title = "Nextstrain Community: Data Sharing via GitHub";
const abstract = (
  <>
    We allow researchers to share their analyses through nextstrain.org by storing the results of their analysis in their own
    <a href="https://github.com/"> GitHub repositories</a>.
    This gives you complete control, ownership, and discretion over your data; there is no need to get in touch with the Nextstrain team to share your data this way.
    For more details, including instructions on what file formats and naming conventions to use,
    <a href="https://docs.nextstrain.org/en/latest/guides/share/community-builds.html"> please see our documentation</a>.
    <br/>
    <br/>
    For an alternative approach to sharing data through nextstrain.org which is allows larger datasets and/or private data sharing, see
    <Link to="/groups"> Scalable Sharing with Nextstrain Groups</Link>.
    <br/>
    <br/>
    We will add a searchable showcase examples of datasets and narratives shared through Nextstrain Community to this page shortly.
    In the meantime,
    <Link to="/#community"> you can see some examples on the main page</Link>.
  </>
);

// eslint-disable-next-line react/prefer-stateless-function
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // For some reason if this is set in the constructor it breaks the banner.
    this.setState({nonExistentDatasetName: this.props["*"]});
  }

  banner() {
    if (this.state.nonExistentDatasetName && (this.state.nonExistentDatasetName.length > 0)) {
      const bannerTitle = `The dataset "nextstrain.org${this.props.location.pathname}" doesn't exist.`;
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
        <HugeSpacer /> <HugeSpacer />

      </GenericPage>
    );
  }
}

export default Index;
