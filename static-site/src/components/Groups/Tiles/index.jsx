import React from "react";
import * as Styles from "./styles";
import { H1 } from "../../splash/styles";
import { MediumSpacer } from "../../../layouts/generalComponents";
import Padlock from "./padlock";

class Tiles extends React.Component {
  tiles(bootstrapColumnSize) {
    return this.props.tiles.map((d) => (
      <div className={`col-sm-${bootstrapColumnSize}`} key={d.name}>
        <Styles.TileOuter $squashed={this.props.squashed}>
          <Styles.TileInner>
            <a href={`${d.url}`}>
              <Styles.TileName $squashed={this.props.squashed}>
                {d.name}
              </Styles.TileName>
              {d.private ? (
                <Styles.BottomRightLabel>
                  <Padlock/>
                </Styles.BottomRightLabel>
              ) : null}
              {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
              {d.img ? <Styles.TileImg src={require(`../../../../static/splash_images/${d.img}`).default.src} alt={""} color={d.color}/> : null}
            </a>
          </Styles.TileInner>
        </Styles.TileOuter>
      </div>
    ));
  }
  render() {
    const bootstrapColumnSize = this.props.compactColumns ? 6 : 4;
    const TILES = this.tiles(bootstrapColumnSize);
    return this.props.compactColumns ? TILES : (
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
              {TILES}
            </div>
          </div>
        </div>
        <div className="col-md-1" />
      </div>
    );
  }
}

export default Tiles;
