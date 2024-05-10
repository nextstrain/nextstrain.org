import React from "react";
import {
  SmallSpacer,
  HugeSpacer,
  FlexCenter,
} from "../layouts/generalComponents";
import ListResources from "../components/ListResources/index";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";

const title = "Nextstrain-maintained core files";
const abstract = (
  <>
    WORK IN PROGRESS - core (intermediate) file listing
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
        <ListResources sourceId="core" resourceType="intermediate" />
        <HugeSpacer/>
      </GenericPage>
    );
  }
}

export default Index;
