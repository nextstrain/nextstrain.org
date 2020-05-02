/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import React from "react";
import Collapsible from "react-collapsible";
import * as Styles from "./styles";
import { H1 } from "../splash/styles";
import { MediumSpacer } from "../../layouts/generalComponents";
import Cards from "./index";

// eslint-disable-next-line react/prefer-stateless-function
class SitRepCards extends React.Component {

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-1" />
          <div className="col-md-10">
            <H1>{this.props.title}</H1>

            {this.props.subtext ?
              (
                <Styles.SubText>
                  {this.props.subtext}
                </Styles.SubText>
              ) :
              null
            }

            <MediumSpacer />

            <div className="row">
              {this.props.narrativesByLanguage.map((language) => (
                <div key={language.name}>
                  <div className="col-sm-4">
                    <Collapsible trigger={
                      <Styles.CardOuter squashed={this.props.squashed}>
                        <Styles.CardInner>
                          <a>
                            <Styles.CardTitle squashed={this.props.squashed}>{language.nativeName}</Styles.CardTitle>
                            <Styles.CardImg src={require(`../../../static/splash_images/ncov_narrative.png`)}/>
                          </a>
                          {/*  */}
                        </Styles.CardInner>
                      </Styles.CardOuter>
                    }
                    >
                      <Cards
                        squashed={this.props.squashed}
                        cards={language.narratives}
                      />
                    </Collapsible>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        <div className="col-md-1" />
      </div>
    );
  }
}

export default SitRepCards;
