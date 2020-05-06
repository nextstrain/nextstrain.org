/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import React from "react";
import Collapsible from "react-collapsible";
import * as Styles from "./styles";
import { H1, H2 } from "../splash/styles";
import { MediumSpacer, Line } from "../../layouts/generalComponents";


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
                  <Collapsible trigger={
                    <div>
                      <Line style={{margin: "10px 0px 10px 0px"}}/>
                      <a href={null}>
                        <H2 squashed={this.props.squashed}>{language.nativeName}</H2>
                      </a>
                      <br/>
                    </div>
                  }
                  >
                    <div className="row">
                      {language.narratives.map((narrative) => (
                        <div className="col-sm-4">
                          <a href={narrative.url}>
                            <Styles.SitRepTitle>{narrative.title}</Styles.SitRepTitle>
                          </a>
                        </div>
                      ))}
                    </div>
                  </Collapsible>
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
