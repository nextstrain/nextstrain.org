import {useState, useEffect} from 'react';
import {parseModelData} from "./parse.js";

const DEFAULT_ENDPOINT_PREFIX = "https://nextstrain-data.s3.amazonaws.com/files/workflows/forecasts-ncov/gisaid/nextstrain_clades/global";
const DEFAULT_RENEWAL_ENPOINT = `${DEFAULT_ENDPOINT_PREFIX}/renewal/latest_results.json`;
const DEFAULT_MLR_ENDPOINT = `${DEFAULT_ENDPOINT_PREFIX}/mlr/latest_results.json`;

export const useDataFetch = () => {
  const [status, setStatus] = useState({msg: 'Downloading model data JSONs (n=2)...'});
  const [modelData, setModelData] = useState(undefined);

  useEffect( () => {
    // start both fetches immediately
    const renewalJson = fetch(process.env.REACT_APP_RENEWAL_ENDPOINT || DEFAULT_RENEWAL_ENPOINT)
      .then((res) => res.json())
    const mlrJson = fetch(process.env.REACT_APP_MLR_ENDPOINT || DEFAULT_MLR_ENDPOINT)
      .then((res) => res.json())

    async function fetchAndParse() {
      let renewalData, mlrData
      try {
        renewalData = await renewalJson;
        mlrData = await mlrJson;
      } catch (err) {
        setStatus({msg: 'Downloading model data JSONs failed.', err})
        return;
      }
      setStatus({msg: "Data downloaded. Processing the data now..."})
      try {
        setModelData(parseModelData(renewalData, mlrData));
      } catch (err) {
        setStatus({msg: 'Downloading model data JSONs succeeded, but parsing the JSONs failed.', err})
      }
    }

    fetchAndParse();
  }, []);


  return [modelData, status]
}
