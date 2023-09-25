import React from "react";
import {Link} from 'gatsby';
import {SmallSpacer,HugeSpacer,FlexCenter} from "../layouts/generalComponents";
import * as splashStyles from "../components/splash/styles";
import GenericPage from "../layouts/generic-page";
import CardsV2 from "../components/CardsV2/index";

const title = "Nextstrain-maintained pathogen analyses";
const abstract = (
  <>  
    This page lists Nextstrain's publicly available intermediate files. 
    Most of these files are used to generate phylogenetic analyses shown on{` `}
    <Link to="/">the (core) pathogens page</Link>
    .
  </>
);

class Index extends React.Component {
  render() {
    console.log('<Pathogens>')
    return (
      <GenericPage location={this.props.location}>
        <splashStyles.H1>{title}</splashStyles.H1>
        <SmallSpacer />

        <FlexCenter>
          <splashStyles.CenteredFocusParagraph>
            {abstract}
          </splashStyles.CenteredFocusParagraph>
        </FlexCenter>

        <HugeSpacer />
        <CardsV2 apiQuery={'prefix=/&versions&type=file'} dataType='file'/>
        <HugeSpacer />
      </GenericPage>
    );
  }
}


export default Index;
