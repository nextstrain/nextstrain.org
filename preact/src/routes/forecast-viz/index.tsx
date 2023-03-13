import {h, Fragment} from 'preact';
import { ModelDataProvider, ModelDataStatus } from 'nextstrain-forecasts-viz';
import { Panels } from './Panels';


function App() {
  return (
    <div className="container forecasts">
      <ModelDataProvider>
        <h1>
          Nextstrain SARS-CoV-2 Forecasts
        </h1>

        <div className="abstract">
          <>This page visualises the evolution and dynamics of SARS-CoV-2 evolution and dynamics using two models:</>
          <ul>
            <li>Multinomial Logistic Regression (MLR) estimates variant frequencies and growth advantages for variants against some baseline using sequence count data</li>
            <li>The variant renewal model estimates variant frequencies, variant-specific incidence, and growth advantages using a combination of case and sequence count data.</li>
          </ul>
          <>Each model uses sequence counts via GISAID and case counts from various sources, collated in our <a href="https://github.com/nextstrain/forecasts-ncov/tree/main/ingest">forecasts-ncov GitHub repo</a>.</>
          <>{` For more information on the models please see the `}<a href="https://www.github.com/blab/evofr">evofr GitHub repo</a> or the preprint <a href="https://bedford.io/papers/figgins-rt-from-frequency-dynamics/">"SARS-CoV-2 variant dynamics across US states show consistent differences in effective reproduction numbers"</a>.</>
          <br/><br/>
          <>Currently we use <a href='https://nextstrain.org/blog/2022-04-29-SARS-CoV-2-clade-naming-2022'>Nextstrain clades</a> to partition the sequences into variants.</>
        </div>

        <ModelDataStatus/>

        <Panels/>

      </ModelDataProvider>
    </div>
  );
}

export default App;
