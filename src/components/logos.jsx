import React from "react";
import {Bigspacer, Flex} from "../layouts/generalComponents";

export const Logos = () => (
  <div className="container">
    <Bigspacer />
    <div className="row">
      <div className="col-md-1" />
      <div className="col-md-10">
        <div className="line" />
        <Flex wrap="wrap" style={{marginTop: 20, justifyContent: "space-around"}}>
          <a key={1} href="http://www.fredhutch.org/" target="_blank" rel="noopener noreferrer">
            <img alt="logo" width="75" src={require("../../static/logos/fred-hutch-logo.png")} />
          </a>
          <a key={2} href="http://www.eb.tuebingen.mpg.de/" target="_blank" rel="noopener noreferrer">
            <img alt="logo" width="65" src={require("../../static/logos/max-planck-logo.png")} />
          </a>
          <a key={3} href="https://www.nih.gov/" target="_blank" rel="noopener noreferrer">
            <img alt="logo" width="52" src={require("../../static/logos/nih-logo.jpg")} />
          </a>
          <a key={4} href="https://erc.europa.eu/" target="_blank" rel="noopener noreferrer">
            <img alt="logo" width="60" src={require("../../static/logos/erc-logo.jpg")} />
          </a>
          <a key={5} href="https://www.openscienceprize.org/" target="_blank" rel="noopener noreferrer">
            <img alt="logo" width="82" src={require("../../static/logos/osp-logo-small.png")} />
          </a>
          <a key={6} href="http://biozentrum.org/" target="_blank" rel="noopener noreferrer">
            <img alt="logo" width="85" src={require("../../static/logos/bz_logo.png")} />
          </a>
        </Flex>
      </div>
      <div className="col-md-1" />
    </div>
    <Bigspacer />
  </div>
)
