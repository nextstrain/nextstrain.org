import React from "react";
import {
  SmallSpacer,
  MediumSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import { ErrorBanner } from "../components/splash/errorMessages";
import Cards from "../components/Cards/index";
import fluCards from "../components/Cards/fluCards";

const title = "Influenza resources";
const abstract = `The Nextstrain team maintains datasets and other tools for analyzing a variety of influenza viruses.
We track the evolution of seasonal influenza viruses (A/H3N2, A/H1N1pdm, B/Victoria, and B/Yamagata)
and use these analyses to inform recommendations for the World Health Organization’s influenza vaccine composition meetings.
We also maintain datasets for a subset of avian influenza viruses that have caused recurrent outbreaks in humans
and domestic birds, including novel reassortant H5 viruses.`;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  async componentDidMount() {
    /**
     * The /influenza page currently appears under three distinct routes:
     * (1) /influenza
     * (2) /influenza/*
     * (3) /flu/* where the path doesn't match an actual (auspice) dataset
     * We use the following pathname inspection to display the appropriate
     * error message (cases (2) and (3) only)
     */
    if (window.location.pathname !== '/influenza') {
      this.setState({
        nonExistentDatasetName: window.location.pathname
      });
    }
  }

  banner() {
    if (this.state.nonExistentDatasetName) {
      const bannerTitle = `The dataset "nextstrain.org${this.state.nonExistentDatasetName}" doesn't exist.`;
      const bannerContents = `Here is the influenza page with a list of Nextstrain-maintained influenza datasets.`;
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

        <MediumSpacer/>
        <Cards squashed cards={fluCards}/>
        <HugeSpacer/>
      </GenericPage>
    );
  }
}

export default Index;
