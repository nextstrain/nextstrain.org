"use client";

/** Mostly copy-paste from
 * https://github.com/nextstrain/forecasts-ncov/blob/main/viz/src/App.jsx
 * https://github.com/nextstrain/forecasts-ncov/blob/main/viz/src/config.js
 */

import { PanelDisplay, useModelData } from '@nextstrain/evofr-viz';
import '@nextstrain/evofr-viz/dist/index.css';


const mlrConfig = {
  modelName: "MLR",
  modelUrl: "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global/mlr/latest_results.json",
  variantColors: new Map([
    ["other", "#595959"],
    ["22B (Omicron)", "#A6A6A6"],
    ["22D (Omicron)", "#4D21AD"],
    ["22E (Omicron)", "#4C90C0"],
    ["22F (Omicron)", "#8EBC66"],
    ["23A (Omicron)", "#DEA73C"],
    ["23B (Omicron)", "#DB2823"],
  ]),
  variantDisplayNames: new Map([
    ["other", "other"],
    ["22B (Omicron)", "22B (BA.5)"],
    ["22D (Omicron)", "22D (BA.2.75)"],
    ["22E (Omicron)", "22E (BQ.1)"],
    ["22F (Omicron)", "22F (XBB)"],
    ["23A (Omicron)", "23A (XBB.1.5)"],
    ["23B (Omicron)", "23B (XBB.1.16)"],
  ])
};

function App() {

  const mlrData = useModelData(mlrConfig);

  return (
    <div>
      <div id="mainPanelsContainer">
        <h2>Frequencies (MLR model)</h2>
        <div id="frequenciesPanel"> {/* surrounding div(s) used for static-images.js script */}
          <PanelDisplay data={mlrData} graphType="frequency"/>
        </div>

        <h2>Growth Advantage (MLR model)</h2>
        <div id="growthAdvantagePanel">
          <PanelDisplay data={mlrData} graphType="growthAdvantage"/>
        </div>

      </div>
    </div>
  );
}

export default App;
