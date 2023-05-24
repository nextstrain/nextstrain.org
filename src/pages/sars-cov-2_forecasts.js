import { html } from 'htm/react';
import { RootLayout } from '../layouts/index.js';
import { ClientComponentPlaceholder } from "../components/clientComponentPlaceholder.js";

/**
 * See ./testing.js for commentary
 */
const SarsCov2Forecasts = () => {
  return html`
    <${RootLayout} title="SARS-CoV-2 forecasts">
      <${ClientComponentPlaceholder}/>
    <//>
  `;
};
SarsCov2Forecasts.clientComponent = 'sars-cov-2_forecasts.js'; // must be the filename relative to `src/client-components`
export {SarsCov2Forecasts};
