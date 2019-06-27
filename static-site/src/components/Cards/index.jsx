import React from "react";
import * as Styles from "./styles";
import { H1 } from "../splash/styles";
import { MediumSpacer, HugeSpacer } from "../../layouts/generalComponents";

const GenerateCards = ({title, cards}) => (
  <div>
    <HugeSpacer />
    <div className="row">
      <div className="col-md-1" />
      <div className="col-md-10">
        <H1>{title}</H1>
        <MediumSpacer />

        <div className="row">
          {cards.map((d) => (
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
      <div className="col-md-1" />
    </div>
  </div>
);

export default GenerateCards;