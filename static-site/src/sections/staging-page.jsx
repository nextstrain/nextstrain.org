import React from "react";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import CardsV2 from "../components/CardsV2/index";

class Index extends React.Component {
  render() {
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H1>Staging Datasets</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            Staging datasets & narratives are intended primarily for internal (Nextstrain team) usage.
            They should be considered unreleased and/or out of date; they should not be used to draw scientific conclusions.
            <p/>
            The listing of these resources is currently not available.
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>

        <CardsV2 apiQuery={'prefix=/staging&versions&type=dataset'} dataType='dataset'/>
        <HugeSpacer />

      </GenericPage>
    );
  }
}

export default Index;
