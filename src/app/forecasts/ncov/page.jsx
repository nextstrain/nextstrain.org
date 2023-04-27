import ForecastsViz from "./forecastsViz.jsx";

export default function Page() {

  return (
    <div>
      <h1>Nextstrain SARS-CoV-2 Forecasts</h1>
      <div className="abstract">
        {`The interactive visualisations of evofr modelling data using `}
        <a href="github.com/nextstrain/forecasts-viz/">our visualisation library</a>.
        <p/>
      </div>
      <ForecastsViz />
    </div>
  );
}
