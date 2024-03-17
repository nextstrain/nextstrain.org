/**
 * Copied from https://github.com/nextstrain/forecasts-viz/blob/7ad27fcd5d892e40e9c9f0be50e7454afe29f005/src/lib/components/Spinner.js
 * which was itself copied from Auspice 
 * https://github.com/nextstrain/auspice/blob/adc6df36c5c36e37fb504274657249a7a1fea0ac/src/components/framework/spinner.js
 * On each copy there were slight modifications
 * NOTE: See also the relevant CSS in ./spinner.css
 */

import React from "react";
import nextstrainLogo from "../../../static/logos/nextstrain-logo-small.png";
import "./spinner.css";

export const Spinner = () => (
  <div className="spinnerContainer">
    <img className="spinner" src={nextstrainLogo} alt="loading"/>
  </div>
)
