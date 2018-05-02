import React from "react";
import styled from "styled-components"
// import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png"
const config = require("../../../data/SiteConfig");

const headerFont = "Lato, Helvetica Neue, Helvetica, sans-serif";

const CardImg = styled.img`
  object-fit: cover;
  width: 100%;
`
const CardInner = styled.div`
  box-shadow: 3px 3px 4px 1px rgba(215,215,215,0.85);
  border-radius: 2px;
  margin: 5px 10px 5px 10px;
  cursor: pointer;
`
const CardOuter = styled.div`
  background-color: #FFFFFF;
  padding: 0;
  overflow: hidden;
  position: relative;
  padding: 15px 0px 15px 0px;
`
const CardTitle = styled.div`
  font-family: ${headerFont};
  font-weight: 500;
  font-size: 28;
  position: absolute;
  padding: 10px 20px 10px 20px;
  top: 40px;
  left: 20px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
`

export const generateTiles = () => (
  <div className="row">
    {config.cards.map((d) => (
      <div key={d.title}>
        <div className="col-sm-4">
          <CardOuter>
            <CardInner>
              <a href={`https://app.nextstrain.org${d.url}`}>
                <CardTitle>
                  {d.title}
                </CardTitle>
                <CardImg src={require(`../../../static/splash_images/${d.img}`)} alt={""} />
              </a>
            </CardInner>
          </CardOuter>
        </div>
      </div>
    ))}
  </div>
)
