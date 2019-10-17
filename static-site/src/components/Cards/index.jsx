/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import React from "react";
import * as Styles from "./styles";
import { H1 } from "../splash/styles";
import { MediumSpacer } from "../../layouts/generalComponents";

// eslint-disable-next-line react/prefer-stateless-function
class Cards extends React.Component {

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
              {this.props.cards.map((d) => (
                <div key={d.title}>
                  <div className="col-sm-4">
                    <Styles.CardOuter>
                      <Styles.CardInner>
                        <a href={`${d.url}`}>
                          <Styles.CardTitle>
                            {d.title}
                          </Styles.CardTitle>
                          <Styles.CardImg src={require(`../../../static/splash_images/${d.img}`)} alt={""} />
                        </a>
                      </Styles.CardInner>
                    </Styles.CardOuter>
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

export default Cards;
