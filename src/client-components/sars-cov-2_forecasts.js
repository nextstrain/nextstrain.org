import React, {useEffect} from 'react';
import { PanelDisplay, useModelData } from '@nextstrain/evofr-viz';
import { renderClientSide } from '../utils/renderClientSide.js';

const DEFAULT_ENDPOINT_PREFIX = "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov";
const mlrCladesUrl = `${DEFAULT_ENDPOINT_PREFIX}/gisaid/nextstrain_clades/global/mlr/latest_results.json`;
const mlrLineagesUrl = `${DEFAULT_ENDPOINT_PREFIX}/gisaid/pango_lineages/global/mlr/latest_results.json`;

const variantColors = new Map([
  ["other", "#595959"],
  ["22B (Omicron)", "#A6A6A6"],
  ["22D (Omicron)", "#4D21AD"],
  ["22E (Omicron)", "#4C90C0"],
  ["22F (Omicron)", "#8EBC66"],
  ["23A (Omicron)", "#DEA73C"],
  ["23B (Omicron)", "#DB2823"],
]);
const variantDisplayNames = new Map([
  ["other", "other"],
  ["22B (Omicron)", "22B (BA.5)"],
  ["22D (Omicron)", "22D (BA.2.75)"],
  ["22E (Omicron)", "22E (BQ.1)"],
  ["22F (Omicron)", "22F (XBB)"],
  ["23A (Omicron)", "23A (XBB.1.5)"],
  ["23B (Omicron)", "23B (XBB.1.16)"],
]);

const mlrCladesConfig = {
  modelName: "mlr_clades",
  modelUrl: mlrCladesUrl,
  sites: undefined, // can restrict the sites parsed from the JSON
  variantColors,
  variantDisplayNames
};

const mlrLineagesConfig = {
  modelName: "mlr_lineages",
  modelUrl: mlrLineagesUrl,
  sites: undefined, // can restrict the sites parsed from the JSON
};


function App() {

  const mlrCladesData = useModelData(mlrCladesConfig);
  const mlrLineagesData = useModelData(mlrLineagesConfig);

  /** Following is a hack to use the stylesheet that comes with the library
   * as a sidecar CSS file. These styles don't belong with the global nextstrain.org
   * styles, but there should be a nicer way to use them!
   */
  useEffect(() => {
    const head = document.head;
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "/assets/css/evofr-forecasts.css";
    head.appendChild(link);
    return () => { head.removeChild(link); };
  });

  return (
    <div className="App">

      <div id="mainPanelsContainer">
        <h2>Clade frequencies over time</h2>
        <p>
          Each line represents the estimated frequency of a particular clade through time.
          Equivalent Pango lineage is given in parenthesis, eg clade 22B (lineage BA.5).
          Results last updated {mlrCladesData?.modelData?.get('updated') || 'loading'}.
        </p>
        <div id="cladeFrequenciesPanel" className="panelDisplay"> {/* surrounding div(s) used for static-images.js script */}
          <PanelDisplay data={mlrCladesData} params={{preset: "frequency"}}/>
        </div>

        <h2>Clade growth advantage</h2>
        <p>
          These plots show the estimated growth advantage for given clades relative to clade
          22B (lineage BA.5). This describes how many more secondary infections a variant causes
          on average relative to clade 22B. Vertical bars show the 95% HPD.
          Results last updated {mlrCladesData?.modelData?.get('updated') || 'loading'}.
        </p>
        <div id="cladeGrowthAdvantagePanel" className="panelDisplay">
          <PanelDisplay data={mlrCladesData} params={{preset: "growthAdvantage"}}/>
        </div>

        <h2>Lineage frequencies over time</h2>
        <p>
          Each line represents the estimated frequency of a particular Pango lineage through time.
          Lineages with fewer than 200 observations are collapsed into parental lineage.
          Results last updated {mlrLineagesData?.modelData?.get('updated') || 'loading'}.
        </p>
        <div id="lineageFrequenciesPanel" className="panelDisplay">
          <PanelDisplay data={mlrLineagesData} params={{preset: "frequency"}}/>
        </div>

        <h2>Lineage growth advantage</h2>
        <p>
          These plots show the estimated growth advantage for given Pango lineages relative to
          lineage BA.5. This describes how many more secondary infections a variant causes
          on average relative to lineage BA.5. Vertical bars show the 95% HPD.
          Results last updated {mlrLineagesData?.modelData?.get('updated') || 'loading'}.
        </p>
        <div id="lineageGrowthAdvantagePanel" className="panelDisplay">
          <PanelDisplay data={mlrLineagesData} params={{preset: "growthAdvantage"}}/>
        </div>

      </div>
    </div>
  );
}

renderClientSide(App);
